-- Supabase schema for incident bundles from correlation agent
-- This keeps the incident graph separate from the flat event stream and matches the
-- incident-centric payload shape that the agent emits.

create extension if not exists pgcrypto;

create table if not exists public.incidents (
  id text primary key,
  title text not null,
  severity text not null check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  confidence double precision not null default 0 check (confidence >= 0 and confidence <= 100),
  status text not null default 'active' check (status in ('active', 'investigating', 'resolved', 'mitigated')),
  service text,
  description text,
  root_cause text,
  start_time timestamptz not null,
  end_time timestamptz,
  correlated_count integer not null default 0,
  affected_services text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  incident_id text not null references public.incidents(id) on delete cascade,
  service text,
  source text,
  event_type text not null,
  message text not null,
  severity text not null check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  timestamp timestamptz not null,
  metric text,
  value double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.event_relationships (
  id uuid primary key default gen_random_uuid(),
  incident_id text not null references public.incidents(id) on delete cascade,
  from_event_id text not null,
  to_event_id text not null,
  relationship_type text not null check (relationship_type in ('PRECEDES', 'CAUSES', 'CORRELATES_WITH', 'BLOCKS')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (incident_id, from_event_id, to_event_id, relationship_type)
);

create index if not exists incidents_severity_idx
  on public.incidents (severity);

create index if not exists incidents_status_idx
  on public.incidents (status);

create index if not exists incidents_start_time_idx
  on public.incidents (start_time desc);

create index if not exists events_incident_id_idx
  on public.events (incident_id);

create index if not exists events_service_idx
  on public.events (service);

create index if not exists events_timestamp_idx
  on public.events (timestamp desc);

create index if not exists event_relationships_incident_idx
  on public.event_relationships (incident_id);

create index if not exists event_relationships_from_idx
  on public.event_relationships (from_event_id);

create index if not exists event_relationships_to_idx
  on public.event_relationships (to_event_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger incidents_set_updated_at
before update on public.incidents
for each row
execute function public.set_updated_at();

-- One-shot ingestion function for the correlation-agent payload.
-- It normalizes the bundle into separate incident, event, and edge rows.
create or replace function public.upsert_incident_bundle(payload jsonb)
returns text
language plpgsql
as $$
declare
  incident_id text;
  incident_title text;
  incident_severity text;
  incident_status text;
  incident_service text;
  incident_start timestamptz;
  incident_end timestamptz;
  incident_confidence double precision;
  affected_services text[];
  events_json jsonb;
  relationships_json jsonb;
  event_item jsonb;
  reason text;
  recommendation jsonb;
begin
  incident_id := payload->>'incident_id';
  incident_title := coalesce(payload->>'incident_title', 'Untitled incident');
  incident_severity := lower(coalesce(payload->>'severity', 'info'));
  incident_status := lower(coalesce(payload->>'status', 'active'));
  incident_service := coalesce(payload->>'service', 'unknown-service');
  incident_start := coalesce((payload->'time_window'->>'start')::timestamptz, now());
  incident_end := nullif(payload->'time_window'->>'end', '')::timestamptz;
  incident_confidence := (
    case
      when payload->>'correlation_score' is null then 0
      else greatest(0, least(100, (payload->>'correlation_score')::double precision * 100))
    end
  );
  affected_services := coalesce(array(select jsonb_array_elements_text(payload->'affected_services')), array[]::text[]);

  if incident_severity = 'warning' then
    incident_severity := 'medium';
  elsif incident_severity in ('critical', 'high', 'medium', 'low', 'info') then
    incident_severity := incident_severity;
  else
    incident_severity := 'info';
  end if;

  insert into public.incidents (
    id,
    title,
    severity,
    confidence,
    status,
    service,
    description,
    root_cause,
    start_time,
    end_time,
    correlated_count,
    affected_services,
    metadata
  )
  values (
    incident_id,
    incident_title,
    incident_severity,
    incident_confidence,
    incident_status,
    incident_service,
    coalesce(payload->>'description', 'This incident was created from correlated agent output.'),
    coalesce(payload->>'rootCause', 'Root cause analysis not provided by the agent payload.'),
    incident_start,
    incident_end,
    coalesce((payload->>'event_count')::int, 0),
    affected_services,
    jsonb_build_object(
      'source', 'correlation_agent',
      'correlation_reasons', coalesce(payload->'correlation_reasons', '[]'::jsonb),
      'recommendations', coalesce(payload->'recommendations', '[]'::jsonb)
    )
  )
  on conflict (id)
  do update set
    title = excluded.title,
    severity = excluded.severity,
    confidence = excluded.confidence,
    status = excluded.status,
    service = excluded.service,
    description = excluded.description,
    root_cause = excluded.root_cause,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    correlated_count = excluded.correlated_count,
    affected_services = excluded.affected_services,
    metadata = excluded.metadata,
    updated_at = now();

  for event_item in select jsonb_array_elements(coalesce(payload->'events', '[]'::jsonb))
  loop
    insert into public.events (
      id,
      incident_id,
      service,
      source,
      event_type,
      message,
      severity,
      timestamp,
      metric,
      value,
      metadata
    )
    values (
      event_item->>'event_id',
      incident_id,
      coalesce(event_item->>'service', incident_service),
      coalesce(event_item->>'source', 'Application Logs'),
      lower(replace(coalesce(event_item->>'event_type', 'log'), '.', '_')),
      coalesce(event_item->>'message', 'Correlated event'),
      case
        when lower(coalesce(event_item->>'severity', 'info')) = 'warning' then 'medium'
        else lower(coalesce(event_item->>'severity', 'info'))
      end,
      coalesce((event_item->>'timestamp')::timestamptz, incident_start),
      event_item->>'metric',
      case when event_item->>'value' is null then null else (event_item->>'value')::double precision end,
      jsonb_strip_nulls(jsonb_build_object(
        'raw_type', event_item->>'event_type',
        'raw_severity', event_item->>'severity',
        'metric', event_item->>'metric',
        'value', event_item->'value'
      ))
    )
    on conflict (id)
    do update set
      incident_id = excluded.incident_id,
      service = excluded.service,
      source = excluded.source,
      event_type = excluded.event_type,
      message = excluded.message,
      severity = excluded.severity,
      timestamp = excluded.timestamp,
      metric = excluded.metric,
      value = excluded.value,
      metadata = excluded.metadata;
  end loop;

  for event_item in select jsonb_array_elements(coalesce(payload->'relationships', '[]'::jsonb))
  loop
    insert into public.event_relationships (
      incident_id,
      from_event_id,
      to_event_id,
      relationship_type,
      metadata
    )
    values (
      incident_id,
      event_item->>'from',
      event_item->>'to',
      coalesce(event_item->>'type', 'PRECEDES'),
      jsonb_build_object('source', 'correlation_agent')
    )
    on conflict (incident_id, from_event_id, to_event_id, relationship_type)
    do nothing;
  end loop;

  return incident_id;
end;
$$;

-- Example usage:
-- select public.upsert_incident_bundle('{
--   "incident_id": "INC-201",
--   "incident_title": "Checkout latency spike",
--   "time_window": {"start": "2026-08-29T09:00:00Z", "end": "2026-08-29T09:10:00Z"},
--   "affected_services": ["checkout-api", "payment-api"],
--   "event_count": 3,
--   "correlation_score": 0.94,
--   "correlation_reasons": ["temporal_proximity", "service_overlap"],
--   "severity": "CRITICAL",
--   "status": "active",
--   "service": "checkout-api",
--   "events": [
--     {"event_id": "evt-1", "service": "checkout-api", "event_type": "business_failure", "severity": "CRITICAL", "source": "Application Logs", "message": "Payment failures started"},
--     {"event_id": "evt-2", "service": "payment-api", "event_type": "metric", "severity": "WARNING", "source": "Datadog", "message": "Latency rose"},
--     {"event_id": "evt-3", "service": "checkout-api", "event_type": "deployment", "severity": "INFO", "source": "GitHub", "message": "Release pushed"}
--   ],
--   "relationships": [
--     {"from": "evt-3", "to": "evt-2", "type": "PRECEDES"},
--     {"from": "evt-2", "to": "evt-1", "type": "PRECEDES"}
--   ]
-- }'::jsonb);
