import { events } from "@/data/events";
import { incidents } from "@/data/incidents";
import { services } from "@/data/services";
import { scenarios } from "@/data/scenarios";
import type { Event, Incident, Service, Scenario } from "@/types";

export async function getIncidents(): Promise<Incident[]> {
  // Simulate small latency
  await delay(80);
  return incidents;
}

export async function getIncident(id: string): Promise<Incident | null> {
  await delay(60);
  return incidents.find((i) => i.id === id) ?? null;
}

export async function getEvents(filters?: {
  service?: string;
  source?: string;
  severity?: string;
  search?: string;
}): Promise<Event[]> {
  await delay(100);
  let result = [...events];

  if (filters?.service && filters.service !== "all") {
    result = result.filter((e) => e.service === filters.service);
  }
  if (filters?.source && filters.source !== "all") {
    result = result.filter((e) => e.source === filters.source);
  }
  if (filters?.severity && filters.severity !== "all") {
    result = result.filter((e) => e.severity === filters.severity);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.message.toLowerCase().includes(q) ||
        e.service.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function getEventsByIncident(incidentId: string): Promise<Event[]> {
  await delay(50);
  return events.filter((e) => e.incidentId === incidentId);
}

export async function getServices(): Promise<Service[]> {
  await delay(70);
  return services;
}

export async function getScenarios(): Promise<Scenario[]> {
  await delay(40);
  return scenarios;
}

export async function runSimulation(scenarioId: string): Promise<{
  eventsGenerated: number;
  candidates: number;
  incidentsIdentified: number;
}> {
  await delay(200);
  // Frontend-only mock response
  if (scenarioId === "scenario-noise") {
    return { eventsGenerated: 28, candidates: 2, incidentsIdentified: 0 };
  }
  if (scenarioId === "scenario-payment") {
    return { eventsGenerated: 42, candidates: 7, incidentsIdentified: 4 };
  }
  return { eventsGenerated: 35, candidates: 5, incidentsIdentified: 3 };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
