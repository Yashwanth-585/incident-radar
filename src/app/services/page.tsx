"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceCard } from "@/components/services/ServiceCard";
import { DependencyGraph } from "@/components/services/DependencyGraph";
import { getServices } from "@/lib/api";
import type { Service } from "@/types";
import { CardSkeleton } from "@/components/ui/LoadingState";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell title="Services">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">Services</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Health and dependency overview across production services.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}

        <DependencyGraph />
      </div>
    </AppShell>
  );
}
