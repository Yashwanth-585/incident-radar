import type { Event, Incident, Service } from "@/types";

export async function getIncidents(): Promise<Incident[]> {
  try {
    const res = await fetch("/api/incidents");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return data.map((d: any) => ({
      id: d.incident_id || String(d.id),
      title: d.incident_title || d.title,
      severity: d.severity || "info",
      confidence: d.correlation_score
        ? Math.round(d.correlation_score * 100)
        : d.confidence || 0,
      status: d.status || "active",
      service:
        d.affected_services && d.affected_services.length > 0
          ? d.affected_services[0]
          : d.service || "unknown",
      description: d.description ?? "",
      rootCause: d.root_cause ?? "",
      startTime: d.start_time || new Date().toISOString(),
      endTime: d.end_time ?? undefined,
      correlatedCount: d.event_count || d.correlated_count || 0,
      affectedServices: d.affected_services ?? [],
      evidence: (d.correlation_reasons ?? []).map((reason: string) => ({
        type: "temporal",
        description: reason,
        strength: 1,
      })),
      recommendations: d.metadata?.recommendations ?? [],
      eventIds: [],
      timeline: [],
    }));
  } catch (error) {
    console.error("Failed to fetch incidents", error);
    return [];
  }
}

export async function getIncident(id: string): Promise<Incident | null> {
  try {
    const res = await fetch(`/api/incidents/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Fetch clean events for this incident
    const eventsRes = await fetch(`/api/events?incidentId=${id}`);
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    const timeline = eventsData.map((e: any) => {
      const date = new Date(e.timestamp);
      const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;

      return {
        time: timeStr,
        title: e.message,
        detail: e.service,
        icon: "activity",
      };
    });

    return {
      id: data.incident_id || String(data.id),
      title: data.incident_title || data.title,
      severity: data.severity || "info",
      confidence: data.correlation_score
        ? Math.round(data.correlation_score * 100)
        : data.confidence || 0,
      status: data.status || "active",
      service:
        data.affected_services && data.affected_services.length > 0
          ? data.affected_services[0]
          : data.service || "unknown",
      description: data.description ?? "",
      rootCause: data.root_cause ?? "",
      startTime: data.start_time || new Date().toISOString(),
      endTime: data.end_time ?? undefined,
      correlatedCount: data.event_count || data.correlated_count || 0,
      affectedServices: data.affected_services ?? [],
      evidence: (data.correlation_reasons ?? []).map((reason: string) => ({
        type: "temporal",
        description: reason,
        strength: 1,
      })),
      recommendations: data.metadata?.recommendations ?? [],
      eventIds: eventsData.map((e: any) => e.event_id || e.id),
      timeline,
    };
  } catch (error) {
    console.error(`Failed to fetch incident ${id}`, error);
    return null;
  }
}

export async function getEvents(filters?: {
  service?: string;
  source?: string;
  severity?: string;
  search?: string;
}): Promise<Event[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.service) params.set("service", filters.service);
    if (filters?.source) params.set("source", filters.source);
    if (filters?.severity) params.set("severity", filters.severity);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/events?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return data.map((e: any) => ({
      id: e.event_id || String(e.id),
      incidentId: e.incident_id,
      service: e.service ?? "unknown",
      source: e.source ?? "unknown",
      type: e.event_type ?? "log",
      message: e.message,
      severity: e.severity ?? "info",
      timestamp: e.timestamp,
      metric: e.metric,
      value: e.value,
      metadata: e.metadata,
    }));
  } catch (error) {
    console.error("Failed to fetch events", error);
    return [];
  }
}

export async function getEventsByIncident(incidentId: string): Promise<Event[]> {
  try {
    const res = await fetch(`/api/events?incidentId=${incidentId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return data.map((e: any) => ({
      id: e.event_id || String(e.id),
      incidentId: incidentId,
      service: e.service ?? "unknown",
      source: e.source ?? "unknown",
      type: e.event_type ?? "log",
      message: e.message,
      severity: e.severity ?? "info",
      timestamp: e.timestamp,
      metric: e.metric,
      value: e.value,
      metadata: e.metadata,
    }));
  } catch (error) {
    console.error(`Failed to fetch events for incident ${incidentId}`, error);
    return [];
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch("/api/services");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch services", error);
    return [];
  }
}
