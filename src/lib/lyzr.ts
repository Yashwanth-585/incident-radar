/**
 * Server-only Lyzr Agent client.
 *
 * This module must NEVER be imported from client components.
 * It reads LYZR_API_KEY from server-side env (no NEXT_PUBLIC_ prefix).
 */

import type { IncidentBundle } from "./ingest";
import type { AiAnalysis } from "@/types";

// ── Configuration ───────────────────────────────────────────

const LYZR_API_URL = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/";

function getLyzrConfig() {
  const apiKey = process.env.LYZR_API_KEY;
  const agentId = process.env.LYZR_AGENT_ID;
  const userId = process.env.LYZR_USER_ID;

  if (!apiKey || !agentId || !userId) {
    throw new Error(
      "Missing Lyzr environment variables. Set LYZR_API_KEY, LYZR_AGENT_ID, and LYZR_USER_ID in .env.local"
    );
  }

  return { apiKey, agentId, userId };
}

// ── Lyzr message builder ────────────────────────────────────

const ANALYSIS_INSTRUCTION = `You are the Incident Radar AI Reasoning Agent.

The following JSON is the output of the Correlation Engine.

The Correlation Engine identifies events that appear related. It does NOT determine root cause.

Analyze the correlated incident using your configured Incident Radar Knowledge Base.

Use the knowledge base to identify relevant incident patterns, hypotheses, and runbooks.

Treat correlation_score as evidence of event relatedness, NOT proof of causality.

Perform evidence-based reasoning.

Identify:
- earliest abnormal signal
- downstream symptoms
- competing hypotheses
- supporting evidence
- contradicting evidence
- missing evidence
- likely root cause
- confidence
- severity
- recommended actions
- rollback recommendation

Do not invent logs, metrics, timestamps, deployments, dependencies, stack traces, or other evidence.

Do not assume that the first event is automatically the root cause.

If the available evidence cannot distinguish between competing hypotheses, return INSUFFICIENT_EVIDENCE.

Return ONLY the configured structured JSON output.

CORRELATION ENGINE OUTPUT:

`;

/**
 * Build the dynamic message to send to the Lyzr agent.
 * Combines the analysis instruction with the serialised correlation bundle.
 */
export function buildLyzrMessage(bundle: IncidentBundle): string {
  // Build the correlation JSON payload that the agent needs to analyze.
  // This mirrors the AgentIncidentPayload shape so the Lyzr agent sees
  // the same structure the Correlation Engine emits.
  const correlationPayload = {
    incident_id: bundle.incident.id,
    incident_title: bundle.incident.title,
    severity: bundle.incident.severity,
    status: bundle.incident.status,
    service: bundle.incident.service,
    description: bundle.incident.description,
    confidence: bundle.incident.confidence,
    correlation_score: bundle.incident.confidence / 100,
    affected_services: bundle.incident.affectedServices,
    correlated_count: bundle.incident.correlatedCount,
    start_time: bundle.incident.startTime,
    end_time: bundle.incident.endTime ?? null,
    events: bundle.events.map((e) => ({
      event_id: e.id,
      service: e.service,
      source: e.source,
      event_type: e.event_type,
      severity: e.severity,
      message: e.message,
      timestamp: e.timestamp,
      metric: e.metric ?? null,
      value: e.value ?? null,
    })),
    relationships: bundle.relationships.map((r) => ({
      from: r.from_event_id,
      to: r.to_event_id,
      type: r.relationship_type,
    })),
  };

  return ANALYSIS_INSTRUCTION + JSON.stringify(correlationPayload, null, 2);
}

// ── Lyzr API call ───────────────────────────────────────────

interface LyzrApiResponse {
  response?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * Calls the Lyzr Incident_Radar_Agent via the v3 inference/chat endpoint.
 * Uses the exact request format from the provided cURL.
 * API key is NEVER logged.
 */
export async function callLyzrAgent(message: string): Promise<{
  response: string;
  sessionId: string;
}> {
  const { apiKey, agentId, userId } = getLyzrConfig();
  const sessionId = `${agentId}-${Date.now().toString(36)}`;

  const requestBody = {
    user_id: userId,
    agent_id: agentId,
    session_id: sessionId,
    message,
  };

  console.log(`[lyzr] Sending request to: ${LYZR_API_URL}`);
  console.log(`[lyzr] Request body (redacted): user_id=${userId}, agent_id=${agentId}, session_id=${sessionId}, message_length=${message.length}`);

  let res: Response;
  try {
    res = await fetch(LYZR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,   // key sent in header, never logged
      },
      body: JSON.stringify(requestBody),
    });
  } catch (networkErr: any) {
    console.error(`[lyzr] Network error reaching Lyzr API:`, networkErr.message);
    throw new Error(`Network error calling Lyzr: ${networkErr.message}`);
  }

  console.log(`[lyzr] HTTP status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "(could not read body)");
    console.error(`[lyzr] API error ${res.status} — body: ${errorText.slice(0, 500)}`);
    throw new Error(`Lyzr API returned ${res.status}: ${errorText.slice(0, 300)}`);
  }

  let data: LyzrApiResponse;
  try {
    data = await res.json();
  } catch (jsonErr: any) {
    const rawText = await res.text().catch(() => "");
    console.error(`[lyzr] Failed to parse Lyzr response as JSON. Raw (first 500): ${rawText.slice(0, 500)}`);
    throw new Error(`Lyzr response is not valid JSON: ${jsonErr.message}`);
  }

  console.log(`[lyzr] Response top-level keys: ${Object.keys(data).join(", ")}`);

  // The Lyzr v3 chat response returns the agent reply in "response"
  const responseText = data.response ?? data.message ?? "";

  if (!responseText) {
    console.error(`[lyzr] Empty response. Full data:`, JSON.stringify(data).slice(0, 1000));
    throw new Error("Lyzr API returned an empty response");
  }

  console.log(`[lyzr] Response text length: ${responseText.length}`);
  return { response: responseText, sessionId };
}

// ── Response parser ─────────────────────────────────────────

/**
 * Extract structured JSON from the Lyzr agent response text.
 * The agent may return raw JSON or wrap it in markdown code fences.
 */
function extractJsonFromResponse(text: string): Record<string, unknown> {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find a JSON object in the text
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new Error("Failed to extract JSON from Lyzr response");
      }
    }
    throw new Error("No JSON object found in Lyzr response");
  }
}

/**
 * Parse and validate the Lyzr agent response into our AiAnalysis shape.
 * Applies sensible defaults for any missing fields.
 */
export function parseLyzrResponse(
  raw: string,
  incidentId: string,
  sessionId: string
): {
  analysis: Omit<AiAnalysis, "id">;
  rawJson: Record<string, unknown>;
} {
  const json = extractJsonFromResponse(raw);

  // Handle INSUFFICIENT_EVIDENCE as a special case
  const evidenceQuality =
    (json.evidence_quality as string) ??
    (json.evidenceQuality as string) ??
    "UNKNOWN";

  // Confidence: Lyzr returns 0.0–1.0 float; we need 0–100 integer.
  const rawConf = (json.confidence as number) ?? (json.confidence_score as number) ?? 0;
  const confidence = rawConf <= 1 ? clampNumber(rawConf * 100, 0, 100) : clampNumber(rawConf, 0, 100);

  const analysis: Omit<AiAnalysis, "id"> = {
    incidentId,
    severity:
      (json.severity as string) ??
      (json.likely_severity as string) ??
      "unknown",
    confidence,
    evidenceQuality,
    rootCause:
      (json.root_cause as string) ??
      (json.likely_root_cause as string) ??
      (json.rootCause as string) ??
      "Unable to determine root cause",
    earliestAbnormalSignal:
      (json.earliest_abnormal_signal as string) ??
      (json.earliestAbnormalSignal as string) ??
      // Lyzr may embed this in causal_chain[0]
      (Array.isArray(json.causal_chain) && json.causal_chain.length > 0
        ? String(json.causal_chain[0])
        : null) ??
      "Not identified",
    causalChain: toStringArray(
      json.causal_chain ?? json.causalChain ?? []
    ),
    downstreamSymptoms: toStringArray(
      json.downstream_symptoms ?? json.downstreamSymptoms ?? []
    ),
    hypotheses: toHypotheses(json.hypotheses ?? json.competing_hypotheses ?? []),
    missingEvidence: toStringArray(
      json.missing_evidence ?? json.missingEvidence ?? []
    ),
    recommendedActions: toActions(
      json.recommended_actions ?? json.recommendedActions ?? []
    ),
    rollbackRecommendation: toRollback(
      json.rollback_recommendation ?? json.rollbackRecommendation ?? {}
    ),
    reasoningSummary:
      (json.reasoning_summary as string) ??
      (json.reasoningSummary as string) ??
      (json.summary as string) ??
      "",
    createdAt: new Date().toISOString(),
  };

  return { analysis, rawJson: json };
}

// ── Helpers ─────────────────────────────────────────────────

function clampNumber(n: unknown, min: number, max: number): number {
  const num = Number(n) || 0;
  return Math.min(max, Math.max(min, num));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => {
    if (typeof v === "string") return v;
    if (typeof v === "object" && v !== null) {
      // Handle objects like { step: "..." } or { description: "..." }
      return (
        (v as Record<string, string>).step ??
        (v as Record<string, string>).description ??
        (v as Record<string, string>).symptom ??
        (v as Record<string, string>).signal ??
        JSON.stringify(v)
      );
    }
    return String(v);
  });
}

function toHypotheses(
  value: unknown
): AiAnalysis["hypotheses"] {
  if (!Array.isArray(value)) return [];
  return value.map((h: Record<string, unknown>) => {
    // Lyzr returns { cause, confidence (0-1), supporting_evidence, contradicting_evidence }
    // Also handle { hypothesis, likelihood } shape as fallback
    const causeText =
      (h.cause as string) ??
      (h.hypothesis as string) ??
      (h.name as string) ??
      (h.title as string) ??
      "Unknown hypothesis";

    // Lyzr confidence is 0–1 float; convert to a readable likelihood label
    const confVal = h.confidence as number | undefined;
    const likelihoodLabel =
      (h.likelihood as string) ??
      (h.probability as string) ??
      (confVal !== undefined
        ? confVal >= 0.75
          ? "high"
          : confVal >= 0.45
          ? "moderate"
          : "low"
        : "unknown");

    return {
      hypothesis: causeText,
      supporting_evidence: toStringArray(
        h.supporting_evidence ?? h.supportingEvidence ?? []
      ),
      contradicting_evidence: toStringArray(
        h.contradicting_evidence ?? h.contradictingEvidence ?? []
      ),
      likelihood: likelihoodLabel,
    };
  });
}

function toActions(
  value: unknown
): AiAnalysis["recommendedActions"] {
  if (!Array.isArray(value)) return [];
  return value.map((a) => {
    // Lyzr returns recommended_actions as a plain string array
    if (typeof a === "string") {
      return { action: a, priority: "medium", rationale: "" };
    }
    const obj = a as Record<string, unknown>;
    return {
      action:
        (obj.action as string) ??
        (obj.step as string) ??
        (obj.title as string) ??
        (obj.description as string) ??
        String(a),
      priority: (obj.priority as string) ?? "medium",
      rationale: (obj.rationale as string) ?? (obj.reason as string) ?? "",
    };
  });
}

function toRollback(value: unknown): AiAnalysis["rollbackRecommendation"] {
  // Lyzr may return a plain string e.g. "CONSIDER", "YES", "NO", "RECOMMENDED"
  if (typeof value === "string") {
    const v = value.toUpperCase();
    const recommended = v === "YES" || v === "RECOMMENDED" || v === "CONSIDER" || v === "TRUE";
    return {
      recommended,
      reason: value,
      target: undefined,
    };
  }
  if (typeof value !== "object" || value === null) {
    return { recommended: false, reason: "No rollback data returned" };
  }
  const obj = value as Record<string, unknown>;
  return {
    recommended: Boolean(obj.recommended ?? obj.should_rollback ?? false),
    reason: (obj.reason as string) ?? (obj.rationale as string) ?? "",
    target: (obj.target as string) ?? (obj.deployment as string) ?? undefined,
  };
}
