"use client";

import type { Service } from "@/types";

export function DependencyGraph({ services = [] }: { services?: Service[] }) {
  if (services.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#121216] p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-zinc-100">
          Service Health & Dependencies Topology
        </h3>
        <span className="text-[11px] text-zinc-500 font-mono">
          {services.length} live services mapped
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {services.map((s) => {
          const isCritical = s.health === "critical";
          const isDegraded = s.health === "degraded";

          let border = "border-zinc-800";
          let bg = "bg-zinc-900/60";
          let badge = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

          if (isCritical) {
            border = "border-red-500/40";
            bg = "bg-red-950/20";
            badge = "bg-red-500/20 text-red-400 border-red-500/30";
          } else if (isDegraded) {
            border = "border-orange-500/30";
            bg = "bg-orange-950/15";
            badge = "bg-orange-500/20 text-orange-400 border-orange-500/30";
          }

          return (
            <div
              key={s.id}
              className={`rounded-lg border ${border} ${bg} p-3.5 flex flex-col justify-between transition-colors`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-zinc-200">
                  {s.name}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${badge}`}
                >
                  {s.health}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
                <span>{s.latencyMs}ms latency</span>
                <span>{s.activeIncidents} active inc</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-zinc-600 text-center">
        Live topology based on current operational events & active correlation clusters
      </p>
    </div>
  );
}
