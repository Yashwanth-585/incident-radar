"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { EventVolumeChart } from "@/components/charts/EventVolumeChart";
import { ErrorRateChart } from "@/components/charts/ErrorRateChart";
import { getIncidents, getEvents } from "@/lib/api";
import type { Incident, Event } from "@/types";
import { KPISkeleton } from "@/components/ui/LoadingState";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function OverviewPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getIncidents(), getEvents()]).then(([incData, evData]) => {
      setIncidents(incData);
      setEvents(evData);
      setLoading(false);
    });
  }, []);

  const activeIncidents = incidents.filter(
    (i) => i.status === "active" || i.status === "investigating"
  );
  const critical = activeIncidents.find((i) => i.severity === "critical") || activeIncidents[0];
  const others = activeIncidents.filter((i) => i.id !== critical?.id).slice(0, 4);

  const severityCounts = {
    critical: incidents.filter((i) => i.severity === "critical").length,
    high: incidents.filter((i) => i.severity === "high").length,
    medium: incidents.filter((i) => i.severity === "medium").length,
    low: incidents.filter((i) => i.severity === "low").length,
  };

  return (
    <AppShell title="Overview">
      <div className="space-y-6 max-w-6xl fade-up">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
              Operational pulse
            </h2>
            <p className="text-[13px] text-zinc-500 mt-1 max-w-md">
              Live operational telemetry correlated into prioritized incidents from Supabase.
            </p>
          </div>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all {incidents.length} incidents
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            <>
              <KPISkeleton />
              <KPISkeleton />
              <KPISkeleton />
              <KPISkeleton />
            </>
          ) : (
            <>
              <KPICard label="Operational Events" value={events.length} hint="Live stream" />
              <KPICard
                label="Active Incidents"
                value={activeIncidents.length}
                hint={`${severityCounts.critical} critical`}
              />
              <KPICard
                label="Correlation Rate"
                value={
                  events.length > 0
                    ? `${Math.min(
                        100,
                        Math.round((incidents.reduce((acc, i) => acc + i.correlatedCount, 0) / Math.max(1, events.length)) * 100)
                      )}%`
                    : "100%"
                }
                hint="Signals clustered"
              />
              <KPICard
                label="Lyzr AI Status"
                value="Active"
                hint="v3 Agent Connected"
              />
            </>
          )}
        </div>

        {/* Severity strip */}
        <div className="flex flex-wrap items-center gap-5 text-[12px]">
          <SeverityPill color="bg-red-500" label="Critical" count={severityCounts.critical} />
          <SeverityPill color="bg-orange-500" label="High" count={severityCounts.high} />
          <SeverityPill color="bg-yellow-500" label="Medium" count={severityCounts.medium} />
          <SeverityPill color="bg-emerald-500" label="Low" count={severityCounts.low} />
        </div>

        {/* Critical incident highlight */}
        {critical && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400/80">
                Primary Incident · Requires Attention
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/20 to-transparent" />
            </div>
            <IncidentCard incident={critical} featured />
          </div>
        )}

        {others.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-2.5">
              Other Active Incidents
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
              {others.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#27272a] bg-[#121216] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Event volume
              </h3>
              <span className="text-[10px] text-zinc-600 font-mono">Live telemetry</span>
            </div>
            <EventVolumeChart />
          </div>
          <div className="rounded-lg border border-[#27272a] bg-[#121216] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Error rate
              </h3>
              <span className="text-[10px] text-zinc-600 font-mono">payment-service</span>
            </div>
            <ErrorRateChart />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KPICard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-[#27272a] bg-[#121216] px-4 py-3.5">
      <p className="text-[11px] text-zinc-500 font-medium">{label}</p>
      <p className="text-[22px] font-semibold tracking-tight text-zinc-50 mt-1 tabular leading-none">
        {value}
      </p>
      {hint && <p className="text-[10px] text-zinc-600 mt-1.5">{hint}</p>}
    </div>
  );
}

function SeverityPill({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-200 font-medium tabular">{count}</span>
    </div>
  );
}
