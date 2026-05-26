-- System coherence automation.
-- Closes proof -> trust -> quality -> animal lifecycle loops without changing existing client contracts.

create or replace function public.bump_trust_snapshot(
  p_subject_type text,
  p_subject_id text,
  p_event_type text,
  p_score_delta integer,
  p_case_id uuid default null,
  p_task_id uuid default null,
  p_proof_id uuid default null,
  p_reason text default '',
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_score integer;
  next_score integer;
  next_risk text;
begin
  if p_subject_id is null or trim(p_subject_id) = '' then
    return;
  end if;

  if p_subject_type not in ('citizen', 'volunteer', 'shelter', 'organization', 'reviewer', 'device') then
    raise exception 'Invalid trust subject type: %', p_subject_type;
  end if;

  insert into public.trust_events (subject_type, subject_id, event_type, score_delta, case_id, task_id, proof_id, reason, metadata, created_by)
  values (p_subject_type, p_subject_id, p_event_type, p_score_delta, p_case_id, p_task_id, p_proof_id, coalesce(p_reason, ''), coalesce(p_metadata, '{}'::jsonb), auth.uid());

  select score into current_score
  from public.trust_scores
  where subject_type = p_subject_type and subject_id = p_subject_id
  for update;

  next_score := greatest(0, least(100, coalesce(current_score, 50) + p_score_delta));
  next_risk := case when next_score >= 70 then 'low' when next_score >= 40 then 'watch' else 'high' end;

  insert into public.trust_scores (subject_type, subject_id, score, reliability_score, evidence_score, safety_score, risk_level, rationale, calculated_at)
  values (p_subject_type, p_subject_id, next_score, next_score, next_score, next_score, next_risk, 'Incremental operational trust from verified workflow events.', now())
  on conflict (subject_type, subject_id) do update set
    score = excluded.score,
    reliability_score = greatest(0, least(100, public.trust_scores.reliability_score + p_score_delta)),
    evidence_score = greatest(0, least(100, public.trust_scores.evidence_score + p_score_delta)),
    safety_score = greatest(0, least(100, public.trust_scores.safety_score + case when p_score_delta < 0 then p_score_delta else 0 end)),
    risk_level = excluded.risk_level,
    rationale = excluded.rationale,
    calculated_at = now(),
    updated_at = now();
end;
$$;

create or replace function public.apply_proof_operational_effects()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  task_row public.tasks;
  case_row public.cases;
  linked_animal_id uuid;
  quality_value integer;
  fraud_value integer;
  location_value text;
  time_value text;
  score_delta integer;
  event_reason text;
begin
  if TG_OP <> 'UPDATE' or old.verification_status is not distinct from new.verification_status then
    return new;
  end if;

  select * into task_row from public.tasks where id = new.task_id;
  if found and task_row.case_id is not null then
    select * into case_row from public.cases where id = task_row.case_id;
  end if;

  linked_animal_id := coalesce(new.animal_id, task_row.animal_id, case_row.animal_id);

  quality_value := case
    when new.verification_status = 'verified' then 86
    when new.verification_status = 'needs_review' then 54
    when new.verification_status = 'rejected' then 24
    else 45
  end;
  fraud_value := case
    when new.verification_status = 'rejected' then 72
    when new.verification_status = 'needs_review' then 34
    else 6
  end;
  location_value := case
    when new.latitude is null or new.longitude is null or task_row.latitude is null or task_row.longitude is null then 'unknown'
    when abs(new.latitude - task_row.latitude) <= 0.01 and abs(new.longitude - task_row.longitude) <= 0.01 then 'nearby'
    else 'mismatch'
  end;
  time_value := case
    when new.captured_at is null then 'unknown'
    when new.captured_at > now() + interval '10 minutes' then 'future'
    when new.captured_at < now() - interval '48 hours' then 'stale'
    else 'match'
  end;
  score_delta := case
    when new.verification_status = 'verified' then 6
    when new.verification_status = 'needs_review' then -1
    when new.verification_status = 'rejected' then -8
    else 0
  end;
  event_reason := 'Proof ' || replace(new.verification_status, '_', ' ') || ' by ops review.';

  insert into public.proof_quality_scores (proof_id, quality_score, fraud_risk_score, location_match, time_match, reviewer_user_id, notes)
  values (new.id, quality_value, fraud_value, location_value, time_value, auth.uid(), event_reason)
  on conflict (proof_id) do update set
    quality_score = excluded.quality_score,
    fraud_risk_score = excluded.fraud_risk_score,
    location_match = excluded.location_match,
    time_match = excluded.time_match,
    reviewer_user_id = excluded.reviewer_user_id,
    notes = excluded.notes,
    created_at = now();

  if task_row.assigned_to_type = 'citizen' and task_row.assigned_to_id is not null then
    perform public.bump_trust_snapshot('device', task_row.assigned_to_id, 'proof.' || new.verification_status, score_delta, task_row.case_id, task_row.id, new.id, event_reason, jsonb_build_object('quality_score', quality_value, 'fraud_risk_score', fraud_value));
  end if;

  if task_row.shelter_id is not null then
    perform public.bump_trust_snapshot('shelter', task_row.shelter_id::text, 'proof.' || new.verification_status, case when score_delta > 0 then 2 else greatest(-4, score_delta / 2) end, task_row.case_id, task_row.id, new.id, event_reason, jsonb_build_object('quality_score', quality_value));
  end if;

  if auth.uid() is not null then
    perform public.bump_trust_snapshot('reviewer', auth.uid()::text, 'proof.reviewed', 1, task_row.case_id, task_row.id, new.id, 'Reviewer completed proof decision.', jsonb_build_object('decision', new.verification_status));
  end if;

  if linked_animal_id is not null and new.verification_status = 'verified' then
    insert into public.animal_events (animal_id, event_type, case_id, task_id, proof_id, block_id, shelter_id, note, evidence_quality, occurred_at, created_by)
    values (linked_animal_id, 'monitoring_started', task_row.case_id, task_row.id, new.id, coalesce(task_row.block_id, case_row.block_id), coalesce(task_row.shelter_id, case_row.shelter_id), 'Verified field proof attached to animal care record.', 'strong', now(), auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists proof_operational_effects on public.proofs;
create trigger proof_operational_effects
  after update on public.proofs
  for each row execute function public.apply_proof_operational_effects();

grant execute on function public.bump_trust_snapshot(text, text, text, integer, uuid, uuid, uuid, text, jsonb) to authenticated;
