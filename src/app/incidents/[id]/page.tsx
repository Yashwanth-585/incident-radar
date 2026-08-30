"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SeverityBadge, Badge } from "@/components/ui/Badge";
import { ConfidenceScore } from "@/components/incidents/ConfidenceScore";
import { EvidenceCard } from "@/components/incidents/EvidenceCard";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { RecommendationCard } from "@/components/incidents/RecommendationCard";
import { EventTable } from "@/components/events/EventTable";
import { getIncident, getEventsByIncident } from "@/lib/api";
import type { Incident, Event, AiAnalysis } from "@/types";
import { ArrowLeft, Brain, Loader2, AlertCircle } from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { AiAnalysisPanel } from "@/components/incidents/AiAnalysisPanel";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getIncident(id), 
      getEventsByIncident(id),
      fetch(`/api/incidents/${id}/analyze`)
        .then((res) => res.json())
        .then((data) => data.analysis)
        .catch((err) => {
          console.error("Failed to fetch existing AI analysis", err);
          return null;
        })
    ]).then(([inc, evts, existingAnalysis]) => {
      setIncident(inc);
      setEvents(evts);
      if (existingAnalysis) {
        setAnalysis(existingAnalysis);
      }
      setLoading(false);
    });
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/incidents/${id}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze incident with Lyzr");
      }
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || "An error occurred during AI analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Investigation">
        <div className="space-y-4 max-w-4xl">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={6} />
        </div>
      </AppShell>
    );
  }

  if (!incident) {
    return (
      <AppShell title="Investigation">
        <div className="text-center py-16">
          <p className="text-zinc-400 text-[13px]">Incident not found.</p>
          <Link
            href="/incidents"
            className="text-[13px] text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            Back to incidents
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={incident.title}>
      <div className="space-y-6 max-w-4xl fade-up">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Incidents
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <SeverityBadge severity={incident.severity} />
            <Badge variant="mono">{incident.id}</Badge>
            <Badge variant="status">{incident.status}</Badge>
            <Badge variant="ai">{incident.confidence}% confidence</Badge>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
            {incident.title}
          </h1>
          <p className="text-[13px] text-zinc-400 mt-2 max-w-2xl leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* AI Correlation Engine & Lyzr Trigger */}
        <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-[#121216] to-[#121216] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-violet-500/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-violet-300/90">
                AI Correlation Engine Output
              </h3>
            </div>
            {!analysis && !analyzing && (
              <Button
                variant="primary"
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white border-violet-500/20 shadow-sm shadow-violet-900/30"
                onClick={handleAnalyze}
              >
                <Brain className="h-3.5 w-3.5" />
                Analyze Incident
              </Button>
            )}
          </div>
          <div className="p-5 flex flex-col sm:flex-row gap-6 items-start">
            <ConfidenceScore value={incident.confidence} />
            <div className="flex-1 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Likely root cause candidate
              </p>
              <p className="text-[14px] text-zinc-200 leading-relaxed">
                {incident.rootCause}
              </p>
            </div>
          </div>
        </div>

        {/* Loading / Error States for Lyzr Agent */}
        {analyzing && (
          <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-950/10 via-[#121216] to-[#121216] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-violet-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[12px] font-semibold uppercase tracking-wider">
                Lyzr Incident_Radar_Agent is reasoning...
              </span>
            </div>
            <div className="space-y-2 mt-4 animate-pulse">
              <div className="h-4 bg-zinc-800/80 rounded w-1/3"></div>
              <div className="h-3 bg-zinc-800/80 rounded w-full"></div>
              <div className="h-3 bg-zinc-800/80 rounded w-5/6"></div>
              <div className="h-3 bg-zinc-800/80 rounded w-4/5"></div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[13px] text-rose-400 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold">AI Analysis Failed</p>
              <p className="text-zinc-400 text-[12px] mt-0.5">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/30 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300"
              onClick={handleAnalyze}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Display Lyzr AI Reasoning Output */}
        {analysis && (
          <AiAnalysisPanel analysis={analysis} title={incident.title} />
        )}

        {incident.evidence.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Evidence chain
            </h3>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {incident.evidence.map((ev, i) => (
                <EvidenceCard key={ev.id} evidence={ev} step={i + 1} />
              ))}
            </div>
          </div>
        )}

        {incident.timeline.length > 0 && (
          <div className="rounded-lg border border-[#27272a] bg-[#121216] p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-5">
              Causal timeline
            </h3>
            <IncidentTimeline items={incident.timeline} />
          </div>
        )}

        {incident.recommendations.length > 0 && (
          <RecommendationCard recommendations={incident.recommendations} />
        )}

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Correlated events · {events.length}
          </h3>
          <EventTable events={events} />
        </div>
      </div>
    </AppShell>
  );
}
