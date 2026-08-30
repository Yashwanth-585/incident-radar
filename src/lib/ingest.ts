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
  const events = (payload.events ?? []).map((event) => ({
    id: event.event_id,
    incident_id: payload.incident_id,
    service: event.service ?? payload.service ?? "unknown-service",
    source: event.source ?? "Application Logs",
    event_type: normalizeEventType(event.event_type),
    message: event.message ?? "Correlated event",
    severity: normalizeSeverity(event.severity as string),
    timestamp: event.timestamp ?? payload.time_window?.start ?? incident.startTime,
    metric: event.metric ?? null,
    value: event.value ?? null,
    metadata: {
      raw_type: event.event_type,
      raw_severity: event.severity,
      ...(event.metric ? { metric: event.metric } : {}),
      ...(event.value !== undefined && event.value !== null ? { value: event.value } : {}),
    },
  }));

  const relationships = (payload.relationships ?? []).map((relationship) => ({
    incident_id: payload.incident_id,
    from_event_id: relationship.from,
    to_event_id: relationship.to,
    relationship_type: relationship.type,
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
    .eq("incident_id", incidentId)
    .single();

  if (incidentError || !incidentData) return null;

  // Fetch linked event IDs from junction table
  const { data: links } = await supabase
    .from("incident_events")
    .select("event_id")
    .eq("incident_id", incidentId);

  const eventIds = (links ?? []).map((l: any) => l.event_id);

  let eventsData: any[] = [];
  if (eventIds.length > 0) {
    const { data: evs } = await supabase
      .from("events")
      .select("*")
      .in("event_id", eventIds);
    eventsData = evs ?? [];
  }

  // Fetch relationships involving these events
  let relationshipsData: any[] = [];
  if (eventIds.length > 0) {
    const { data: rels } = await supabase
      .from("event_relationships")
      .select("*")
      .in("from_event_id", eventIds);
    relationshipsData = rels ?? [];
  }

  return {
    incident: {
      id: incidentData.incident_id,
      title: incidentData.incident_title,
      severity: incidentData.severity,
      confidence: incidentData.correlation_score ? Math.round(incidentData.correlation_score * 100) : 0,
      status: incidentData.status,
      service: incidentData.affected_services?.[0] || "unknown",
      description: incidentData.description ?? "",
      rootCause: incidentData.root_cause ?? "",
      startTime: incidentData.start_time,
      endTime: incidentData.end_time ?? undefined,
      correlatedCount: incidentData.event_count || 0,
      affectedServices: incidentData.affected_services ?? [],
      evidence: (incidentData.correlation_reasons ?? []).map((reason: string) => ({
        type: "temporal",
        description: reason,
        strength: 1
      })),
      recommendations: incidentData.metadata?.recommendations ?? [],
      eventIds: eventIds,
      timeline: [],
    },
    events: eventsData.map((event: any) => ({
      id: event.event_id,
      incident_id: incidentId,
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
    relationships: relationshipsData.map((relationship: any) => ({
      incident_id: incidentId,
      from_event_id: relationship.from_event_id,
      to_event_id: relationship.to_event_id,
      relationship_type: relationship.relationship || "PRECEDES",
      metadata: relationship.metadata ?? {},
    })),
  };
}
