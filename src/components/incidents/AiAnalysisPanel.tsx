"use client";

import React, { useState } from "react";
import type { AiAnalysis } from "@/types";
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  RotateCcw, 
  ListTodo,
  FileSearch,
  Check,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

interface AiAnalysisPanelProps {
  analysis: AiAnalysis;
  title: string;
}

export function AiAnalysisPanel({ analysis, title }: AiAnalysisPanelProps) {
  const { addToast } = useApp();
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  const getEvidenceQualityColor = (quality: string) => {
    switch (quality.toUpperCase()) {
      case "STRONG":
      case "HIGH":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "MODERATE":
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "WEAK":
      case "LOW":
      case "INSUFFICIENT_EVIDENCE":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700/50";
    }
  };

  return (
    <div className="space-y-6 fade-up">
      {/* Overview Block */}
      <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-[#121216] to-[#0c0c0e] overflow-hidden shadow-lg shadow-violet-950/10">
        <div className="px-4 py-3 border-b border-violet-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-400 animate-pulse" />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-violet-300">
              Lyzr AI Radar Reasoning
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Analyzed {new Date(analysis.createdAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Confidence Gauge */}
            <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/60">
              <div className="relative inline-flex items-center justify-center shrink-0">
                <svg width="72" height="72" className="-rotate-90">
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="4"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="url(#aiConfGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={2 * Math.PI * 30 * (1 - analysis.confidence / 100)}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="aiConfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[15px] font-bold text-zinc-100 tabular leading-none">
                    {analysis.confidence}%
                  </span>
                  <span className="text-[7.5px] uppercase tracking-wider text-zinc-500 mt-0.5">
                    CONFIDENCE
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Evidence Quality
                </p>
                <div className={`mt-1.5 px-2 py-0.5 inline-flex text-[11px] font-medium rounded border ${getEvidenceQualityColor(analysis.evidenceQuality)}`}>
                  {analysis.evidenceQuality.replace(/_/g, " ")}
                </div>
              </div>
            </div>

            {/* Core Summary fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Likely Root Cause
                </p>
                <p className="text-[14px] text-zinc-100 font-medium leading-relaxed mt-1">
                  {analysis.rootCause}
                </p>
              </div>

              {analysis.earliestAbnormalSignal && (
                <div className="bg-violet-950/10 border border-violet-900/30 p-2.5 rounded text-[13px] flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-violet-300">Earliest Signal: </span>
                    <span className="text-zinc-300">{analysis.earliestAbnormalSignal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reasoning Summary Section */}
          <div className="border-t border-zinc-800/80 pt-4">
            <button
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              className="w-full flex items-center justify-between text-left text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Reasoning Summary
              </span>
              {summaryExpanded ? (
                <ChevronUp className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              )}
            </button>
            {summaryExpanded && (
              <p className="mt-2.5 text-[13px] text-zinc-400 leading-relaxed bg-zinc-900/30 p-3.5 rounded border border-zinc-800/50">
                {analysis.reasoningSummary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Causal Chain & Downstream Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Causal Chain */}
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-zinc-400" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Causal Chain Progression
            </h3>
          </div>
          
          {analysis.causalChain && analysis.causalChain.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-zinc-800/80 space-y-4 py-1">
              {analysis.causalChain.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-bold text-zinc-400">
                    {idx + 1}
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-zinc-500 italic">No causal chain progression generated.</p>
          )}
        </div>

        {/* Downstream Symptoms */}
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-zinc-400" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Downstream Symptoms
              </h3>
            </div>
            {analysis.downstreamSymptoms && analysis.downstreamSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.downstreamSymptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 text-[12px] rounded border border-zinc-800 bg-zinc-900/50 text-zinc-300"
                  >
                    {symptom}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-zinc-500 italic">No downstream symptoms identified.</p>
            )}
          </div>

          {/* Missing Evidence warning box */}
          {analysis.missingEvidence && analysis.missingEvidence.length > 0 && (
            <div className="mt-6 p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
              <div className="flex items-center gap-1.5 text-yellow-500/80 mb-2">
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Missing Diagnostic Evidence
                </span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                {analysis.missingEvidence.map((evidence, idx) => (
                  <li key={idx} className="text-[12px] text-zinc-400">
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Competing Hypotheses */}
      {analysis.hypotheses && analysis.hypotheses.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileSearch className="h-4 w-4 text-zinc-400" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Competing Hypotheses
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.hypotheses.map((hyp, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-2 mb-3">
                    <span className="text-[13px] font-semibold text-zinc-200">
                      {hyp.hypothesis}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      hyp.likelihood.toLowerCase() === "high" || hyp.likelihood.toLowerCase() === "likely"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : hyp.likelihood.toLowerCase() === "medium" || hyp.likelihood.toLowerCase() === "moderate"
                        ? "text-yellow-400 bg-yellow-500/10"
                        : "text-zinc-400 bg-zinc-800"
                    }`}>
                      {hyp.likelihood}
                    </span>
                  </div>

                  {/* Supporting/Contradicting Evidence */}
                  <div className="space-y-3">
                    {hyp.supporting_evidence && hyp.supporting_evidence.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block mb-1">
                          Supporting Evidence
                        </span>
                        <ul className="space-y-1">
                          {hyp.supporting_evidence.map((ev, i) => (
                            <li key={i} className="text-[12px] text-zinc-400 flex items-start gap-1">
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hyp.contradicting_evidence && hyp.contradicting_evidence.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block mb-1">
                          Contradicting Evidence
                        </span>
                        <ul className="space-y-1">
                          {hyp.contradicting_evidence.map((ev, i) => (
                            <li key={i} className="text-[12px] text-zinc-400 flex items-start gap-1">
                              <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="rounded-lg border border-zinc-800 bg-[#121216] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1f1f24] flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-zinc-400" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            AI Recommended Runbook / Mitigations
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {analysis.recommendedActions && analysis.recommendedActions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.recommendedActions.map((action, idx) => (
                <div key={idx} className="border border-zinc-800 bg-zinc-900/30 rounded-lg p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-medium text-zinc-200">
                        {action.action}
                      </span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                    {action.rationale && (
                      <p className="text-[12px] text-zinc-400 leading-normal">
                        <span className="font-semibold text-zinc-500">Rationale: </span>
                        {action.rationale}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-zinc-500 italic">No recommended actions generated.</p>
          )}

          {/* Rollback Recommendation Box */}
          {analysis.rollbackRecommendation && (
            <div className={`p-4 rounded-lg border ${
              analysis.rollbackRecommendation.recommended 
                ? "border-rose-500/20 bg-rose-950/10" 
                : "border-zinc-800 bg-zinc-900/20"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className={`h-4 w-4 ${analysis.rollbackRecommendation.recommended ? "text-rose-400" : "text-zinc-400"}`} />
                <h4 className={`text-[12px] font-bold uppercase tracking-wider ${
                  analysis.rollbackRecommendation.recommended ? "text-rose-400" : "text-zinc-400"
                }`}>
                  Rollback Recommendation: {analysis.rollbackRecommendation.recommended ? "CRITICAL ACTION" : "DEFERRED"}
                </h4>
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                {analysis.rollbackRecommendation.reason}
              </p>
              {analysis.rollbackRecommendation.recommended && analysis.rollbackRecommendation.target && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-mono">Target Deployment:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 border border-rose-500/25 text-rose-400">
                    {analysis.rollbackRecommendation.target}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ml-auto"
                    onClick={() =>
                      addToast(
                        `Rollback of ${analysis.rollbackRecommendation.target} queued via API integration.`,
                        "warning"
                      )
                    }
                  >
                    Trigger Rollback
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
