"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { SimulationState } from "@/types";

interface Toast {
  id: string;
  message: string;
  type?: "info" | "success" | "warning";
}

interface AppContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
  runMainSimulation: () => Promise<void>;
  eventCount: number;
  setEventCount: (n: number) => void;
  simulationComplete: boolean;
  setSimulationComplete: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialSim: SimulationState = {
  running: false,
  stage: 0,
  message: "",
  eventsGenerated: 0,
  candidates: 0,
  incidents: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [simulation, setSimulation] = useState<SimulationState>(initialSim);
  const [eventCount, setEventCount] = useState(187);
  const [simulationComplete, setSimulationComplete] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const runMainSimulation = useCallback(async () => {
    setSimulationComplete(false);
    setEventCount(0);
    setSimulation({
      running: true,
      stage: 1,
      message: "Generating events...",
      eventsGenerated: 0,
      candidates: 0,
      incidents: 0,
    });

    const stages = [
      { events: 47, msg: "Collecting operational signals...", delay: 700 },
      { events: 103, msg: "Ingesting metrics & logs...", delay: 800 },
      { events: 187, msg: "187 events received", delay: 600 },
      {
        events: 187,
        msg: "Correlating signals...",
        candidates: 7,
        delay: 900,
      },
      {
        events: 187,
        msg: "7 incident candidates detected",
        candidates: 7,
        delay: 700,
      },
      {
        events: 187,
        msg: "4 meaningful incidents identified",
        candidates: 7,
        incidents: 4,
        delay: 800,
      },
    ];

    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      await new Promise((r) => setTimeout(r, s.delay));
      setEventCount(s.events);
      setSimulation({
        running: true,
        stage: i + 2,
        message: s.msg,
        eventsGenerated: s.events,
        candidates: s.candidates ?? 0,
        incidents: s.incidents ?? 0,
      });
    }

    await new Promise((r) => setTimeout(r, 600));
    setSimulation({
      running: false,
      stage: 99,
      message: "Simulation complete",
      eventsGenerated: 187,
      candidates: 7,
      incidents: 4,
    });
    setSimulationComplete(true);
    addToast("Production simulation complete — critical incident surfaced", "success");
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        toasts,
        addToast,
        removeToast,
        simulation,
        setSimulation,
        runMainSimulation,
        eventCount,
        setEventCount,
        simulationComplete,
        setSimulationComplete,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
