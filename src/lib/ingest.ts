import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Event, Incident } from "@/types";
import {
  mapAgentOutputToIncident,
  normalizeEventType,
  normalizeSeverity,
  type AgentIncidentPayload,
} from "./mappers";

export interface EventRow {
  id: string;
  incident_id: string;
  service: string;
  source: string;
  event_type: string;
  message: string;
  severity: string;
  timestamp: string;
  metric?: string | null;
  value?: number | string | null;
  metadata?: Record<string, unknown>;
}

export interface IncidentBundle {
  incident: Incident;
  events: EventRow[];
  relationships: Array<{
    incident_id: string;
    from_event_id: string;
    to_event_id: string;
    relationship_type: string;
    metadata?: Record<string, unknown>;
  }>;
}

export const supabase:
  | SupabaseClient<any, "public", any>
  | null = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export function buildIncidentBundle(payload: AgentIncidentPayload): IncidentBundle {
  const incident = mapAgentOutputToIncident(payload);
  const events = (payload.events ?? []).map((event, index) => ({
    id: event.event_id ?? event.id ?? `${payload.incident_id}-evt-${index + 1}`,
    incident_id: payload.incident_id,
    service: event.service ?? payload.service ?? "unknown-service",
    source: event.source ?? "Application Logs",
    event_type: normalizeEventType(event.event_type ?? event.eventType),
    message: event.message ?? "Correlated event",
    severity: normalizeSeverity(event.severity as string),
    timestamp: event.timestamp ?? payload.time_window?.start ?? incident.startTime,
    metric: event.metric ?? null,
    value: event.value ?? null,
    metadata: {
      raw_type: event.event_type ?? event.eventType,
      raw_severity: event.severity,
      ...(event.metric ? { metric: event.metric } : {}),
      ...(event.value !== undefined && event.value !== null ? { value: event.value } : {}),
    },
  }));

  const relationships = (payload.relationships ?? []).map((relationship, index) => ({
    incident_id: payload.incident_id,
    from_event_id: relationship.from ?? relationship.from_event ?? `${payload.incident_id}-evt-${index + 1}-from`,
    to_event_id: relationship.to ?? relationship.to_event ?? `${payload.incident_id}-evt-${index + 1}-to`,
    relationship_type: relationship.type ?? relationship.relationship ?? "PRECEDES",
    metadata: {
      source: "correlation_agent",
    },
  }));

  return { incident, events, relationships };
}

export async function upsertIncidentBundle(payload: AgentIncidentPayload): Promise<Incident> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const bundle = buildIncidentBundle(payload);

  const { error: incidentError } = await supabase.from("incidents").upsert(
    {
      id: bundle.incident.id,
      title: bundle.incident.title,
      severity: bundle.incident.severity,
      confidence: bundle.incident.confidence,
      status: bundle.incident.status,
      service: bundle.incident.service,
      description: bundle.incident.description,
      root_cause: bundle.incident.rootCause,
      start_time: bundle.incident.startTime,
      end_time: bundle.incident.endTime ?? null,
      correlated_count: bundle.incident.correlatedCount,
      affected_services: bundle.incident.affectedServices,
      metadata: {
        evidence: bundle.incident.evidence,
        recommendations: bundle.incident.recommendations,
      },
    },
    { onConflict: "id" }
  );

  if (incidentError) throw incidentError;

  if (bundle.events.length > 0) {
    const { error: eventsError } = await supabase.from("events").upsert(bundle.events, {
      onConflict: "id",
    });

    if (eventsError) throw eventsError;
  }

  if (bundle.relationships.length > 0) {
    const { error: relationshipsError } = await supabase
      .from("event_relationships")
      .upsert(bundle.relationships, {
        onConflict: "incident_id,from_event_id,to_event_id,relationship_type",
      });

    if (relationshipsError) throw relationshipsError;
  }

  return bundle.incident;
}

export async function getIncidentBundleById(incidentId: string): Promise<IncidentBundle | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data: incidentData, error: incidentError } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", incidentId)
    .single();

  if (incidentError || !incidentData) return null;

  const { data: eventsData } = await supabase.from("events").select("*").eq("incident_id", incidentId);
  const { data: relationshipsData } = await supabase
    .from("event_relationships")
    .select("*")
    .eq("incident_id", incidentId);

  return {
    incident: {
      id: incidentData.id,
      title: incidentData.title,
      severity: incidentData.severity,
      confidence: incidentData.confidence,
      status: incidentData.status,
      service: incidentData.service,
      description: incidentData.description ?? "",
      rootCause: incidentData.root_cause ?? "",
      startTime: incidentData.start_time,
      endTime: incidentData.end_time ?? undefined,
      correlatedCount: incidentData.correlated_count,
      affectedServices: incidentData.affected_services ?? [],
      evidence: incidentData.metadata?.evidence ?? [],
      recommendations: incidentData.metadata?.recommendations ?? [],
      eventIds: (eventsData ?? []).map((event: any) => event.id),
      timeline: [],
    },
    events: (eventsData ?? []).map((event: any) => ({
      id: event.id,
      incident_id: event.incident_id,
      service: event.service ?? "unknown-service",
      source: event.source ?? "Application Logs",
      event_type: event.event_type,
      message: event.message,
      severity: event.severity,
      timestamp: event.timestamp,
      metric: event.metric,
      value: event.value,
      metadata: event.metadata ?? {},
    })),
    relationships: (relationshipsData ?? []).map((relationship: any) => ({
      incident_id: relationship.incident_id,
      from_event_id: relationship.from_event_id,
      to_event_id: relationship.to_event_id,
      relationship_type: relationship.relationship_type,
      metadata: relationship.metadata ?? {},
    })),
  };
}
