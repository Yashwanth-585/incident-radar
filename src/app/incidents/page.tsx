"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { getIncidents } from "@/lib/api";
import type { Incident } from "@/types";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIncidents().then((data) => {
      setIncidents(data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell title="Incidents">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">Incidents</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {loading ? "Loading..." : `${incidents.length} incidents`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            title="No active incidents"
            description="Your production environment is healthy."
          />
        ) : (
          <div className="grid gap-3">
            {incidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                featured={inc.id === "INC-001"}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
