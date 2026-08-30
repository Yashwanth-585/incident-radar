-- AI analysis results from the Lyzr Incident_Radar_Agent.
-- Stores structured reasoning output linked to correlation-engine incidents.
-- One analysis per incident (upsert on incident_id).

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  incident_id text not null references public.incidents(id) on delete cascade,
  severity text,
  confidence double precision check (confidence >= 0 and confidence <= 100),
  evidence_quality text,
  root_cause text,
  earliest_abnormal_signal text,
  causal_chain jsonb not null default '[]'::jsonb,
  downstream_symptoms jsonb not null default '[]'::jsonb,
  hypotheses jsonb not null default '[]'::jsonb,
  missing_evidence jsonb not null default '[]'::jsonb,
  recommended_actions jsonb not null default '[]'::jsonb,
  rollback_recommendation jsonb not null default '{}'::jsonb,
  reasoning_summary text,
  raw_response jsonb not null default '{}'::jsonb,
  lyzr_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (incident_id)
);

create index if not exists ai_analyses_incident_id_idx
  on public.ai_analyses (incident_id);

create trigger ai_analyses_set_updated_at
before update on public.ai_analyses
for each row
execute function public.set_updated_at();
