/**
 * DEBUG-ONLY route: POST /api/incidents/:incidentId/raw-lyzr
 *
 * Returns the raw, unprocessed JSON from the Lyzr agent so we can
 * inspect its exact field names and fix the parser.
 *
 * Remove or gate behind env var before production.
 */

import { NextResponse } from "next/server";
import { buildLyzrMessage, callLyzrAgent } from "@/lib/lyzr";
import { incidents } from "@/data/incidents";
import { events } from "@/data/events";
import type { IncidentBundle, EventRow } from "@/lib/ingest";

function buildBundleFromStaticData(incidentId: string): IncidentBundle | null {
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident) return null;
  const incidentEvents = events.filter((e) => e.incidentId === incidentId);
  const eventRows: EventRow[] = incidentEvents.map((e) => ({
    id: e.id,
    incident_id: incidentId,
    service: e.service,
    source: e.source,
    event_type: e.type,
    message: e.message,
    severity: e.severity,
    timestamp: e.timestamp,
    metric: e.metric ?? null,
    value: typeof e.value === "number" ? e.value : null,
    metadata: e.metadata ?? {},
  }));
  const relationships = incidentEvents.slice(0, -1).map((e, idx) => ({
    incident_id: incidentId,
    from_event_id: e.id,
    to_event_id: incidentEvents[idx + 1].id,
    relationship_type: "PRECEDES" as const,
  }));
  return { incident, events: eventRows, relationships };
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await params;
  const bundle = buildBundleFromStaticData(incidentId);
  if (!bundle) {
    return NextResponse.json({ error: `Incident not found: ${incidentId}` }, { status: 404 });
  }
  const message = buildLyzrMessage(bundle);
  const { response, sessionId } = await callLyzrAgent(message);

  // Return both the raw text and attempted JSON parse
  let rawJson: unknown = null;
  let parseError: string | null = null;
  try {
    let cleaned = response.trim();
    const fence = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fence) cleaned = fence[1].trim();
    rawJson = JSON.parse(cleaned);
  } catch (e: any) {
    parseError = e.message;
  }

  return NextResponse.json({
    sessionId,
    rawText: response,
    rawJson,
    parseError,
  });
}
