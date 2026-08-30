import { createClient } from "@supabase/supabase-js";
import { runCorrelationEngine } from "../corelation-engine/engine";
import type { EventSignal, ServiceNode } from "../corelation-engine/types";
import { loadEnvConfig } from "@next/env";

// Load local env using Next.js native env loader
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in env");
  process.exit(1);
}

const supabase = createClient(url, key);

const serviceNodes: ServiceNode[] = [
  { id: "svc-api-gw", name: "api-gateway", type: "gateway", criticality: "high", dependencies: ["checkout-api", "auth-api"] },
  { id: "svc-payment", name: "payment-service", type: "api", criticality: "critical", dependencies: ["postgres-primary"] },
  { id: "svc-auth", name: "auth-api", type: "api", criticality: "high", dependencies: ["postgres-primary", "redis-cache"] },
  { id: "svc-checkout", name: "checkout-api", type: "api", criticality: "critical", dependencies: ["payment-service", "auth-api", "postgres-primary", "redis-cache"] },
  { id: "svc-postgres", name: "postgres-primary", type: "database", criticality: "critical", dependencies: [] },
  { id: "svc-redis", name: "redis-cache", type: "cache", criticality: "medium", dependencies: [] },
  { id: "svc-notify", name: "notification-service", type: "worker", criticality: "low", dependencies: [] }
];

async function main() {
  console.log("Fetching raw events from operational_events...");
  const { data: rawEvents, error: fetchErr } = await supabase
    .from("operational_events")
    .select("*")
    .order("timestamp", { ascending: true });

  if (fetchErr || !rawEvents) {
    console.error("Failed to fetch raw events:", fetchErr?.message);
    process.exit(1);
  }

  console.log(`Fetched ${rawEvents.length} raw events. Formatting signals...`);

  // Map to EventSignal format
  const events: EventSignal[] = rawEvents.map((e) => ({
    id: e.event_id,
    timestamp: e.timestamp,
    service: e.service,
    source: e.source,
    eventType: e.event_type,
    severity: e.severity as any,
    message: e.message,
    metadata: e.metadata || {}
  }));

  console.log("Running Correlation Engine...");
  const result = runCorrelationEngine(events, serviceNodes);

  console.log(`Engine run complete!`);
  console.log(`- Candidates found: ${result.candidates.length}`);
  console.log(`- Correlated events: ${result.summary.correlatedEventCount}`);

  for (let i = 0; i < result.candidates.length; i++) {
    const candidate = result.candidates[i];
    const candidateEvents = rawEvents.filter(e => candidate.eventIds.includes(e.event_id));
    
    // Sort events by timestamp to find boundary times
    const sortedTimestamps = candidateEvents
      .map(e => new Date(e.timestamp).getTime())
      .sort((a, b) => a - b);
    
    const startTime = sortedTimestamps.length > 0 ? new Date(sortedTimestamps[0]).toISOString() : new Date().toISOString();
    const endTime = sortedTimestamps.length > 1 ? new Date(sortedTimestamps[sortedTimestamps.length - 1]).toISOString() : null;

    // Severity based on highest event severity
    const severities = candidateEvents.map(e => e.severity);
    const severity = severities.includes("critical") ? "critical"
      : severities.includes("high") ? "high"
      : severities.includes("medium") ? "medium"
      : "low";

    const incidentId = `INC-${String(100 + i + 1)}`;
    console.log(`\nProcessing candidate: ${candidate.title} (${incidentId})`);
    console.log(`- Clustered events count: ${candidateEvents.length}`);
    console.log(`- Service names involved: ${candidate.serviceNames.join(", ")}`);

    // 1. Upsert incident
    const { error: incErr } = await supabase
      .from("incidents")
      .upsert({
        incident_id: incidentId,
        incident_title: candidate.title,
        start_time: startTime,
        end_time: endTime,
        affected_services: candidate.serviceNames,
        event_count: candidateEvents.length,
        correlation_score: candidate.confidence,
        correlation_reasons: candidate.evidence.map(ev => ev.description),
        status: "active",
        severity: severity
      }, { onConflict: "incident_id" });

    if (incErr) {
      console.error(`- Failed to upsert incident ${incidentId}:`, incErr.message);
      continue;
    }
    console.log(`- Upserted incident record`);

    // 2. Insert clustered events into the 'events' table
    for (const rawEv of candidateEvents) {
      const { error: evErr } = await supabase
        .from("events")
        .upsert({
          event_id: rawEv.event_id,
          tenant_id: rawEv.tenant_id,
          timestamp: rawEv.timestamp,
          service: rawEv.service,
          source: rawEv.source,
          event_type: rawEv.event_type,
          severity: rawEv.severity,
          message: rawEv.message,
          metadata: rawEv.metadata || {}
        }, { onConflict: "event_id" });

      if (evErr) {
        console.error(`  - Failed to write event ${rawEv.event_id}:`, evErr.message);
        continue;
      }

      // 3. Link them via incident_events junction table
      const { data: existingLink } = await supabase
        .from("incident_events")
        .select("*")
        .eq("incident_id", incidentId)
        .eq("event_id", rawEv.event_id)
        .limit(1);

      if (!existingLink || existingLink.length === 0) {
        const { error: linkErr } = await supabase
          .from("incident_events")
          .insert({
            incident_id: incidentId,
            event_id: rawEv.event_id
          });

        if (linkErr) {
          console.error(`  - Failed to link event ${rawEv.event_id}:`, linkErr.message);
        }
      }
    }
    console.log(`- Correlated events and junction links populated`);
  }

  // 4. Save event relationships
  console.log(`\nSaving event relationships...`);
  for (const rel of result.correlations) {
    const { data: existingRel } = await supabase
      .from("event_relationships")
      .select("*")
      .eq("from_event_id", rel.eventAId)
      .eq("to_event_id", rel.eventBId)
      .limit(1);

    if (!existingRel || existingRel.length === 0) {
      const { error: relErr } = await supabase
        .from("event_relationships")
        .insert({
          from_event_id: rel.eventAId,
          to_event_id: rel.eventBId,
          relationship: rel.relationship,
          confidence: rel.factors.overall
        });

      if (relErr) {
        console.error(`- Failed to write relation ${rel.eventAId} -> ${rel.eventBId}:`, relErr.message);
      }
    }
  }
  console.log("Relations saved successfully!");
  console.log("All tasks complete!");
}

main();
