/**
 * POST /api/incidents/:incidentId/analyze
 * GET  /api/incidents/:incidentId/analyze
 *
 * Runs Lyzr AI Agent root-cause analysis on an incident from Supabase.
 */

import { NextResponse } from "next/server";
import { buildLyzrMessage, callLyzrAgent, parseLyzrResponse } from "@/lib/lyzr";
import type { AiAnalysis } from "@/types";
import { getIncidentBundleById, supabase } from "@/lib/ingest";

// ─── POST ──────────────────────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await params;
  console.log(`\n[analyze] ── POST /api/incidents/${incidentId}/analyze ──`);

  try {
    // 1. Verify env vars are loaded (keys are redacted in logs)
    const apiKeySet = !!process.env.LYZR_API_KEY;
    const agentIdSet = !!process.env.LYZR_AGENT_ID;
    const userIdSet = !!process.env.LYZR_USER_ID;
    console.log(
      `[analyze] Env check — LYZR_API_KEY:${apiKeySet} LYZR_AGENT_ID:${agentIdSet} LYZR_USER_ID:${userIdSet}`
    );
    if (!apiKeySet || !agentIdSet || !userIdSet) {
      return NextResponse.json(
        {
          error:
            "Missing Lyzr environment variables. Check LYZR_API_KEY, LYZR_AGENT_ID, LYZR_USER_ID in .env.local.",
        },
        { status: 500 }
      );
    }

    // 2. Fetch correlation bundle from Supabase
    const bundle = await getIncidentBundleById(incidentId);

    if (!bundle) {
      console.log(`[analyze] Incident not found: ${incidentId}`);
      return NextResponse.json(
        { error: `Incident not found: ${incidentId}` },
        { status: 404 }
      );
    }

    console.log(
      `[analyze] Bundle loaded for "${bundle.incident.title}" — events: ${bundle.events.length}, relationships: ${bundle.relationships.length}`
    );

    // 3. Build Lyzr message
    const message = buildLyzrMessage(bundle);
    console.log(`[analyze] Message length: ${message.length} chars`);
    console.log(
      `[analyze] Correlation payload preview (first 300 chars): ${message.slice(
        -300
      )}`
    );

    // 4. Call Lyzr agent
    console.log(
      `[analyze] Calling Lyzr agent at ${process.env.LYZR_AGENT_ID}...`
    );
    let lyzrResponse: { response: string; sessionId: string };
    try {
      lyzrResponse = await callLyzrAgent(message);
      console.log(
        `[analyze] Lyzr responded — session: ${lyzrResponse.sessionId}, response length: ${lyzrResponse.response.length}`
      );
    } catch (lyzrErr: any) {
      console.error(`[analyze] Lyzr API call failed:`, lyzrErr.message);
      return NextResponse.json(
        { error: `Lyzr agent error: ${lyzrErr.message}` },
        { status: 502 }
      );
    }

    // 5. Parse the response
    let analysis: Omit<AiAnalysis, "id">;
    let rawJson: Record<string, unknown>;
    try {
      const parsed = parseLyzrResponse(
        lyzrResponse.response,
        incidentId,
        lyzrResponse.sessionId
      );
      analysis = parsed.analysis;
      rawJson = parsed.rawJson;
      console.log(
        `[analyze] Parse succeeded — rootCause: "${analysis.rootCause?.slice(
          0,
          80
        )}"`
      );
      console.log(
        `[analyze] Evidence quality: ${analysis.evidenceQuality}, Confidence: ${analysis.confidence}`
      );
    } catch (parseErr: any) {
      console.error(`[analyze] Response parsing failed:`, parseErr.message);
      console.error(
        `[analyze] Raw response that failed to parse (first 1000 chars): ${lyzrResponse.response.slice(
          0,
          1000
        )}`
      );
      return NextResponse.json(
        { error: `Failed to parse Lyzr response: ${parseErr.message}` },
        { status: 422 }
      );
    }

    // 6. Persist to Supabase
    if (supabase) {
      const { error: upsertError } = await supabase.from("ai_analyses").upsert(
        {
          incident_id: analysis.incidentId,
          severity: analysis.severity,
          confidence: analysis.confidence,
          evidence_quality: analysis.evidenceQuality,
          root_cause: analysis.rootCause,
          earliest_abnormal_signal: analysis.earliestAbnormalSignal,
          causal_chain: analysis.causalChain,
          downstream_symptoms: analysis.downstreamSymptoms,
          hypotheses: analysis.hypotheses,
          missing_evidence: analysis.missingEvidence,
          recommended_actions: analysis.recommendedActions,
          rollback_recommendation: analysis.rollbackRecommendation,
          reasoning_summary: analysis.reasoningSummary,
          raw_response: rawJson,
          lyzr_session_id: lyzrResponse.sessionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "incident_id" }
      );
      if (upsertError) {
        console.error(
          "[analyze] Supabase upsert error:",
          JSON.stringify(upsertError)
        );
      } else {
        console.log("[analyze] Supabase upsert succeeded.");
      }
    }

    // 7. Return result
    const result: AiAnalysis = {
      id: `local-${incidentId}-${Date.now()}`,
      ...analysis,
    };
    console.log(`[analyze] ── Done. Returning analysis to client. ──\n`);
    return NextResponse.json({
      ...result,
      lyzrSessionId: lyzrResponse.sessionId,
    });
  } catch (error: any) {
    console.error(`[analyze] Unhandled error:`, error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET ───────────────────────────────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await params;

  try {
    if (!supabase) {
      return NextResponse.json({ analysis: null });
    }
    const { data, error } = await supabase
      .from("ai_analyses")
      .select("*")
      .eq("incident_id", incidentId)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ analysis: null });

    const analysis: AiAnalysis = {
      id: data.id,
      incidentId: data.incident_id,
      severity: data.severity,
      confidence: data.confidence,
      evidenceQuality: data.evidence_quality,
      rootCause: data.root_cause,
      earliestAbnormalSignal: data.earliest_abnormal_signal,
      causalChain: data.causal_chain || [],
      downstreamSymptoms: data.downstream_symptoms || [],
      hypotheses: data.hypotheses || [],
      missingEvidence: data.missing_evidence || [],
      recommendedActions: data.recommended_actions || [],
      rollbackRecommendation: data.rollback_recommendation || {},
      reasoningSummary: data.reasoning_summary,
      createdAt: data.created_at,
    };
    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ analysis: null });
  }
}
