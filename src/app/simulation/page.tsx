"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SimulationCard } from "@/components/simulation/SimulationCard";
import { SimulationProgress } from "@/components/simulation/SimulationProgress";
import { getScenarios, runSimulation } from "@/lib/api";
import type { Scenario, SimulationState } from "@/types";
import { useApp } from "@/context/AppContext";
import { CardSkeleton } from "@/components/ui/LoadingState";

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSim, setLocalSim] = useState<SimulationState>({
    running: false,
    stage: 0,
    message: "",
    eventsGenerated: 0,
    candidates: 0,
    incidents: 0,
  });
  const { addToast } = useApp();

  useEffect(() => {
    getScenarios().then((data) => {
      setScenarios(data);
      setLoading(false);
    });
  }, []);

  const handleRun = async (scenarioId: string) => {
    setLocalSim({
      running: true,
      stage: 1,
      message: "Generating events...",
      eventsGenerated: 0,
      candidates: 0,
      incidents: 0,
    });

    await new Promise((r) => setTimeout(r, 800));
    setLocalSim((s) => ({
      ...s,
      stage: 2,
      message: "Events received...",
      eventsGenerated: 20,
    }));

    await new Promise((r) => setTimeout(r, 700));
    setLocalSim((s) => ({
      ...s,
      stage: 3,
      message: "Correlating signals...",
      eventsGenerated: 35,
    }));

    const result = await runSimulation(scenarioId);

    await new Promise((r) => setTimeout(r, 600));
    setLocalSim({
      running: true,
      stage: 4,
      message: `${result.candidates} incident candidates detected`,
      eventsGenerated: result.eventsGenerated,
      candidates: result.candidates,
      incidents: 0,
    });

    await new Promise((r) => setTimeout(r, 700));
    setLocalSim({
      running: false,
      stage: 5,
      message:
        result.incidentsIdentified > 0
          ? `${result.incidentsIdentified} meaningful incidents identified`
          : "No coherent incidents formed from noise",
      eventsGenerated: result.eventsGenerated,
      candidates: result.candidates,
      incidents: result.incidentsIdentified,
    });

    addToast(
      result.incidentsIdentified > 0
        ? `Scenario complete — ${result.incidentsIdentified} incidents created`
        : "Noise generation complete — no incidents correlated",
      "success"
    );
  };

  return (
    <AppShell title="Production Simulation">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">
            Production Simulation
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Generate realistic operational events and watch Incident Radar
            correlate them into incidents.
          </p>
        </div>

        {(localSim.running || localSim.stage > 0) && (
          <SimulationProgress state={localSim} />
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {scenarios.map((s) => (
              <SimulationCard
                key={s.id}
                scenario={s}
                onRun={handleRun}
                running={localSim.running}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
