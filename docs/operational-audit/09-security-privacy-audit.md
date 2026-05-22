# 09 Security And Privacy Audit

## Current Controls
- Supabase env vars are optional and not hardcoded.
- Secret scan script blocks common tracked secrets.
- Hub requires session and `user_profiles.role='ops'` when configured.
- Migration 003 enables stricter RLS: citizen owns own records; ops all-access.
- Mobile uses anonymous auth to avoid PII by default.

## Risks
- Anonymous sign-in must be enabled in Supabase settings for strict RLS to work.
- Proof photo local URI is not a secure media pipeline.
- No rate limiting for spam reports beyond platform defaults.
- Migration 004 adds automatic audit logging for core operational mutations, but no hub audit-log screen or required override reason policy exists yet.
- No fine-grained role policies for dispatcher/city/shelter/vet/donor.
- Migration 004 adds location privacy metadata, but sensitive rescue locations still need capture/display policy before public map exposure.

## Required Security Work
- Surface the operational audit log in hub and require override reasons for risky transitions.
- Add rate limiting/moderation for reports and proofs.
- Add storage bucket policies and virus/content checks for proof images.
- Wire capture/display policy for the precise vs public-safe location privacy model added in migration 004.
- Expand roles and RLS scoping.
- Add soft-delete/archive instead of destructive delete.

## Environment Variables
- Hub: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Mobile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- No service role key should ship to browser/mobile.
