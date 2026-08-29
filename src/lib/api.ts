import { events as mockEvents } from "@/data/events";
import { incidents as mockIncidents } from "@/data/incidents";
import { services as mockServices } from "@/data/services";
import { scenarios as mockScenarios } from "@/data/scenarios";
import { getIncidentBundleById, supabase } from "@/lib/ingest";
import { normalizeEventType, normalizeSeverity } from "@/lib/mappers";
import type { Event, Incident, Service, Scenario } from "@/types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapRecordToIncident(row: any): Incident {
  return {
    id: row.id,
    title: row.title ?? "Untitled incident",
    severity: (row.severity ?? "info") as Incident["severity"],
    confidence: Number(row.confidence ?? 0),
    status: (row.status ?? "active") as Incident["status"],
    service: row.service ?? "unknown-service",
    description: row.description ?? "",
    rootCause: row.root_cause ?? "",
    startTime: row.start_time ?? new Date().toISOString(),
    endTime: row.end_time ?? undefined,
    correlatedCount: Number(row.correlated_count ?? 0),
    affectedServices: Array.isArray(row.affected_services) ? row.affected_services : [],
    evidence: Array.isArray(row.metadata?.evidence) ? row.metadata.evidence : [],
    recommendations: Array.isArray(row.metadata?.recommendations) ? row.metadata.recommendations : [],
    eventIds: [],
    timeline: [],
  };
}

function mapRecordToEvent(row: any): Event {
  return {
    id: row.id,
    timestamp: row.timestamp ?? new Date().toISOString(),
    service: row.service ?? "unknown-service",
    source: (row.source ?? "Application Logs") as Event["source"],
    type: normalizeEventType(row.event_type ?? row.type),
    message: row.message ?? "Correlated event",
    severity: normalizeSeverity(row.severity as string),
    incidentId: row.incident_id ?? undefined,
    metric: row.metric ?? undefined,
    value: row.value ?? undefined,
    metadata: row.metadata ?? {},
  };
}

export async function getIncidents(): Promise<Incident[]> {
  await delay(80);

  if (!supabase) {
    return mockIncidents;
  }

  const { data, error } = await supabase.from("incidents").select("*").order("start_time", {
    ascending: false,
  });

  if (error) {
    console.error("Failed to fetch incidents from Supabase", error);
    return mockIncidents;
  }

  return (data ?? []).map(mapRecordToIncident);
}

export async function getIncident(id: string): Promise<Incident | null> {
  await delay(60);

  if (supabase) {
    const bundle = await getIncidentBundleById(id);
    if (bundle) {
      return bundle.incident;
    }
  }

  return mockIncidents.find((incident) => incident.id === id) ?? null;
}

export async function getEvents(filters?: {
  service?: string;
  source?: string;
  severity?: string;
  search?: string;
}): Promise<Event[]> {
  await delay(100);

  if (!supabase) {
    let result = [...mockEvents];

    if (filters?.service && filters.service !== "all") {
      result = result.filter((event) => event.service === filters.service);
    }
    if (filters?.source && filters.source !== "all") {
      result = result.filter((event) => event.source === filters.source);
    }
    if (filters?.severity && filters.severity !== "all") {
      result = result.filter((event) => event.severity === filters.severity);
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (event) =>
          event.message.toLowerCase().includes(query) ||
          event.service.toLowerCase().includes(query) ||
          event.source.toLowerCase().includes(query)
      );
    }

    return result;
  }

  let query = supabase.from("events").select("*").order("timestamp", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch events from Supabase", error);
    return mockEvents;
  }

  let result = (data ?? []).map(mapRecordToEvent);

  if (filters?.service && filters.service !== "all") {
    result = result.filter((event) => event.service === filters.service);
  }
  if (filters?.source && filters.source !== "all") {
    result = result.filter((event) => event.source === filters.source);
  }
  if (filters?.severity && filters.severity !== "all") {
    result = result.filter((event) => event.severity === filters.severity);
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (event) =>
        event.message.toLowerCase().includes(query) ||
        event.service.toLowerCase().includes(query) ||
        event.source.toLowerCase().includes(query)
    );
  }

  return result;
}

export async function getEventsByIncident(incidentId: string): Promise<Event[]> {
  await delay(50);

  if (!supabase) {
    return mockEvents.filter((event) => event.incidentId === incidentId);
  }

  const { data, error } = await supabase.from("events").select("*").eq("incident_id", incidentId);

  if (error) {
    console.error("Failed to fetch events by incident from Supabase", error);
    return mockEvents.filter((event) => event.incidentId === incidentId);
  }

  return (data ?? []).map(mapRecordToEvent);
}

export async function getServices(): Promise<Service[]> {
  await delay(70);
  return mockServices;
}

export async function getScenarios(): Promise<Scenario[]> {
  await delay(40);
  return mockScenarios;
}

export async function runSimulation(scenarioId: string): Promise<{
  eventsGenerated: number;
  candidates: number;
  incidentsIdentified: number;
}> {
  await delay(200);
  if (scenarioId === "scenario-noise") {
    return { eventsGenerated: 28, candidates: 2, incidentsIdentified: 0 };
  }
  if (scenarioId === "scenario-payment") {
    return { eventsGenerated: 42, candidates: 7, incidentsIdentified: 4 };
  }
  return { eventsGenerated: 35, candidates: 5, incidentsIdentified: 3 };
}
