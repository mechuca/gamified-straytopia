-- Forecast generation job.
-- Generates transparent rule-based area forecasts from operational rows.

create or replace function public.generate_area_forecasts(p_window_hours integer default 72)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted_count integer;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can generate forecasts';
  end if;

  delete from public.area_forecasts
  where model_version = 'rule-v1'
    and window_start >= date_trunc('hour', now());

  with block_signals as (
    select
      b.id as block_id,
      count(c.id) filter (where c.status not in ('resolved', 'closed', 'rejected')) as open_cases,
      count(c.id) filter (where c.status not in ('resolved', 'closed', 'rejected') and c.severity = 'urgent') as urgent_cases,
      count(c.id) filter (where c.status not in ('resolved', 'closed', 'rejected') and c.category in ('rescue', 'injured', 'sick', 'aggressive', 'abandoned')) as rescue_cases,
      count(t.id) filter (where t.status in ('queued', 'assigned', 'in_progress', 'proof_pending') and tt.type = 'feed') as feeding_tasks,
      count(t.id) filter (where t.status in ('queued', 'assigned', 'in_progress', 'proof_pending') and tt.type = 'water_refill') as water_tasks,
      count(t.id) filter (where t.status in ('blocked', 'escalated')) as blocked_tasks,
      count(t.id) filter (where t.assigned_to_type = 'citizen' and t.status in ('queued', 'assigned', 'in_progress', 'proof_pending')) as citizen_tasks,
      count(s.id) filter (where s.status = 'active') as active_shelters,
      count(s.id) filter (where s.status = 'limited') as limited_shelters
    from public.blocks b
    left join public.cases c on c.block_id = b.id
    left join public.tasks t on t.block_id = b.id
    left join public.task_templates tt on tt.id = t.template_id
    left join public.shelters s on s.block_id = b.id
    group by b.id
  ), forecasts as (
    select block_id, 'rescue_surge'::text as forecast_type,
      least(100, (rescue_cases * 18 + urgent_cases * 22 + blocked_tasks * 12))::integer as risk_score,
      jsonb_build_object('rescue_cases', rescue_cases, 'urgent_cases', urgent_cases, 'blocked_tasks', blocked_tasks) as drivers,
      'Pre-position rescue responders and confirm nearest shelter intake before new urgent reports arrive.'::text as recommended_action
    from block_signals
    union all
    select block_id, 'feeding_gap', least(100, (open_cases * 8 + greatest(0, 3 - feeding_tasks) * 18))::integer,
      jsonb_build_object('open_cases', open_cases, 'open_feeding_tasks', feeding_tasks),
      'Create or assign feeding coverage before open case pressure turns into rescue load.'
    from block_signals
    union all
    select block_id, 'water_gap', least(100, (open_cases * 6 + greatest(0, 2 - water_tasks) * 24))::integer,
      jsonb_build_object('open_cases', open_cases, 'open_water_tasks', water_tasks),
      'Check water stations and assign refill tasks where coverage is thin.'
    from block_signals
    union all
    select block_id, 'volunteer_shortage', least(100, (open_cases * 10 + blocked_tasks * 14 + greatest(0, 2 - citizen_tasks) * 20))::integer,
      jsonb_build_object('open_cases', open_cases, 'citizen_tasks', citizen_tasks, 'blocked_tasks', blocked_tasks),
      'Recruit or route trusted nearby volunteers before queued work ages out.'
    from block_signals
    union all
    select block_id, 'shelter_overload', least(100, (urgent_cases * 18 + limited_shelters * 25 + greatest(0, 1 - active_shelters) * 30))::integer,
      jsonb_build_object('urgent_cases', urgent_cases, 'active_shelters', active_shelters, 'limited_shelters', limited_shelters),
      'Confirm intake capacity and avoid routing to limited partners without human confirmation.'
    from block_signals
  )
  insert into public.area_forecasts (
    block_id,
    forecast_type,
    window_start,
    window_end,
    risk_score,
    confidence,
    drivers,
    recommended_action,
    model_version
  )
  select
    block_id,
    forecast_type,
    date_trunc('hour', now()),
    date_trunc('hour', now()) + make_interval(hours => greatest(1, p_window_hours)),
    risk_score,
    case when risk_score >= 70 then 'high' when risk_score >= 35 then 'medium' else 'low' end,
    drivers,
    recommended_action,
    'rule-v1'
  from forecasts
  where risk_score > 0;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.generate_area_forecasts(integer) from public;
grant execute on function public.generate_area_forecasts(integer) to authenticated;
