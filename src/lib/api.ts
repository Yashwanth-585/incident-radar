'use client';

import { incidents } from '@/data/incidents';
import { events } from '@/data/events';
import { services } from '@/data/services';
import { scenarios } from '@/data/scenarios';
import { Incident, Event, Service, Scenario } from '@/types';

// Simulate API delays for realism
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getIncidents(): Promise<Incident[]> {
  await delay(300);
  return incidents;
}

export async function getIncident(id: string): Promise<Incident | null> {
  await delay(200);
  const incident = incidents.find((i) => i.id === id);
  return incident || null;
}

export async function getEvents(limit?: number): Promise<Event[]> {
  await delay(400);
  return limit ? events.slice(0, limit) : events;
}

export async function getEventsByIncident(incidentId: string): Promise<Event[]> {
  await delay(300);
  return events.filter((e) => e.incidentId === incidentId);
}

export async function getServices(): Promise<Service[]> {
  await delay(250);
  return services;
}

export async function getScenarios(): Promise<Scenario[]> {
  await delay(150);
  return scenarios;
}

export async function runSimulation(scenario: Scenario) {
  // Simulate running a scenario with progressive updates
  const stages = [
    { stage: 'Initializing...', percentage: 10, events: 0 },
    { stage: 'Generating events...', percentage: 30, events: 42 },
    { stage: 'Processing signals...', percentage: 50, events: 103 },
    { stage: 'Correlating events...', percentage: 70, events: 187 },
    { stage: 'Detecting incident candidates...', percentage: 85, events: 187 },
    { stage: 'Finalizing analysis...', percentage: 95, events: 187 },
  ];

  const updates = [];
  for (const stage of stages) {
    await delay(800);
    updates.push(stage);
  }

  return {
    success: true,
    stages: updates,
    finalEventCount: 187,
    candidateIncidents: 7,
    confirmedIncidents: 4,
  };
}
