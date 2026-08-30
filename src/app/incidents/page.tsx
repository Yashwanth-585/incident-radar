"use client";

import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import {
  IncidentFilters,
  type IncidentFilterState,
} from "@/components/incidents/IncidentFilters";
import { getIncidents } from "@/lib/api";
import type { Incident, Severity } from "@/types";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

const severityRank: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<IncidentFilterState>({
    search: "",
    severity: "all",
    status: "all",
    service: "all",
    sortBy: "severity-desc", // Default: Critical on top, High next, Low last
  });

  useEffect(() => {
    getIncidents()
      .then((data) => {
        setIncidents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Dynamically extract all services involved in incidents
  const services = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((inc) => {
      if (inc.service && inc.service !== "unknown") set.add(inc.service);
      if (Array.isArray(inc.affectedServices)) {
        inc.affectedServices.forEach((s) => set.add(s));
      }
    });
    return Array.from(set).sort();
  }, [incidents]);

  // Filter and sort incidents
  const processedIncidents = useMemo(() => {
    let result = incidents.filter((inc) => {
      // Severity filter
      if (filters.severity !== "all" && inc.severity !== filters.severity) {
        return false;
      }
      // Status filter
      if (filters.status !== "all" && inc.status !== filters.status) {
        return false;
      }
      // Service filter
      if (filters.service !== "all") {
        const matchesService =
          inc.service === filters.service ||
          (Array.isArray(inc.affectedServices) &&
            inc.affectedServices.includes(filters.service));
        if (!matchesService) return false;
      }
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesId = inc.id.toLowerCase().includes(q);
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesDesc = inc.description.toLowerCase().includes(q);
        const matchesService =
          inc.service.toLowerCase().includes(q) ||
          inc.affectedServices.some((s) => s.toLowerCase().includes(q));
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesService) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === "severity-desc") {
        const rankA = severityRank[a.severity] ?? 5;
        const rankB = severityRank[b.severity] ?? 5;
        if (rankA !== rankB) return rankA - rankB; // Lower rank number = more critical
        // Secondary sort: newest first
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }

      if (filters.sortBy === "severity-asc") {
        const rankA = severityRank[a.severity] ?? 5;
        const rankB = severityRank[b.severity] ?? 5;
        if (rankA !== rankB) return rankB - rankA;
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }

      if (filters.sortBy === "time-desc") {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }

      if (filters.sortBy === "time-asc") {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }

      if (filters.sortBy === "confidence-desc") {
        return b.confidence - a.confidence;
      }

      return 0;
    });

    return result;
  }, [incidents, filters]);

  const severityCounts = useMemo(() => {
    return {
      critical: incidents.filter((i) => i.severity === "critical").length,
      high: incidents.filter((i) => i.severity === "high").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      low: incidents.filter((i) => i.severity === "low").length,
    };
  }, [incidents]);

  return (
    <AppShell title="Incidents">
      <div className="space-y-5 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-50">Incidents</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {loading
                ? "Loading incidents from Supabase..."
                : `${incidents.length} total incidents · ${severityCounts.critical} critical · ${severityCounts.high} high`}
            </p>
          </div>
        </div>

        {/* Filters & Sorting Bar */}
        {!loading && !error && incidents.length > 0 && (
          <IncidentFilters
            filters={filters}
            onChange={setFilters}
            services={services}
            totalCount={incidents.length}
            filteredCount={processedIncidents.length}
          />
        )}

        {/* Content list */}
        {loading ? (
          <div className="grid gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[13px] text-rose-400">
            {error}
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            title="No incidents detected"
            description="Your production environment is healthy with no correlated incidents."
          />
        ) : processedIncidents.length === 0 ? (
          <EmptyState
            title="No matching incidents"
            description="No incidents match the selected search and filter criteria."
          />
        ) : (
          <div className="grid gap-3">
            {processedIncidents.map((inc, i) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                featured={i === 0 && inc.severity === "critical"}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
