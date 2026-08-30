"use client";

import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EventTable } from "@/components/events/EventTable";
import { EventFilters } from "@/components/events/EventFilters";
import { getEvents } from "@/lib/api";
import type { Event } from "@/types";
import { CardSkeleton } from "@/components/ui/LoadingState";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    service: "all",
    source: "all",
    severity: "all",
  });

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const services = useMemo(
    () => Array.from(new Set(events.map((e) => e.service))).sort(),
    [events]
  );
  const sources = useMemo(
    () => Array.from(new Set(events.map((e) => e.source))).sort(),
    [events]
  );

  const filtered = useMemo(() => {
    let result = events;
    if (filters.service !== "all") {
      result = result.filter((e) => e.service === filters.service);
    }
    if (filters.source !== "all") {
      result = result.filter((e) => e.source === filters.source);
    }
    if (filters.severity !== "all") {
      result = result.filter((e) => e.severity === filters.severity);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filters]);

  return (
    <AppShell title="Operational Events">
      <div className="space-y-5 max-w-7xl">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">
            Operational Events
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {loading ? "Loading..." : `${events.length} events`}
          </p>
        </div>

        <EventFilters
          filters={filters}
          onChange={setFilters}
          services={services}
          sources={sources}
        />

        {loading ? (
          <CardSkeleton lines={8} />
        ) : (
          <EventTable events={filtered} />
        )}
      </div>
    </AppShell>
  );
}
