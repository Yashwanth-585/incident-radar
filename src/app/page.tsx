'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { KPICard } from '@/components/common/KPICard';
import {
  IncidentCard,
  SeverityBadge,
  ConfidenceScore,
} from '@/components/incidents';
import { EventVolumeChart, ErrorRateChart } from '@/components/charts/Charts';
import { Card, Button, Toast, LoadingState } from '@/components/ui/index';
import { getIncidents, runSimulation, getScenarios } from '@/lib/api';
import { Incident, Scenario } from '@/types/index';
import { Activity, AlertTriangle, TrendingDown, Zap } from 'lucide-react';

export default function Overview() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [simulationStages, setSimulationStages] = useState<string[]>([]);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    setSimulationStages([]);

    try {
      const scenarios = await getScenarios();
      const result = await runSimulation(scenarios[0]);

      // Simulate stage progression
      for (const stage of result.stages) {
        setSimulationStages((prev) => [...prev, stage.stage]);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setToast({
        message: `Simulation complete: ${result.finalEventCount} events, ${result.confirmedIncidents} incidents created`,
        type: 'success',
      });

      // Reload incidents to show simulation results
      await loadIncidents();
    } catch (error) {
      setToast({
        message: 'Simulation failed',
        type: 'error',
      });
    } finally {
      setSimulating(false);
      setTimeout(() => setSimulationStages([]), 2000);
    }
  };

  const handleAction = (action: string) => {
    setToast({
      message: `${action} request queued — backend integration coming soon.`,
      type: 'info',
    });
  };

  if (loading) {
    return (
      <Layout title="Incident Overview">
        <LoadingState />
      </Layout>
    );
  }

  const criticalIncident = incidents.find((i) => i.severity === 'critical');
  const otherIncidents = incidents.filter((i) => i.severity !== 'critical');
  const severityCounts = {
    critical: incidents.filter((i) => i.severity === 'critical').length,
    high: incidents.filter((i) => i.severity === 'high').length,
    medium: incidents.filter((i) => i.severity === 'medium').length,
    low: incidents.filter((i) => i.severity === 'low').length,
  };

  const eventCount = 187;
  const correlationRate = 94.6;
  const meanDetectionTime = '42 sec';

  return (
    <Layout
      title="Incident Overview"
      subtitle="Real-time operational intelligence across your production environment."
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Events" value={eventCount} icon={Activity} />
          <KPICard label="Active Incidents" value={incidents.length} icon={AlertTriangle} />
          <KPICard
            label="Correlated"
            value={`${correlationRate}%`}
            icon={TrendingDown}
          />
          <KPICard label="Mean Detection Time" value={meanDetectionTime} icon={Zap} />
        </div>

        {/* Severity Summary */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-100">Severity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔴</span>
                <div>
                  <p className="text-xs text-slate-500">Critical</p>
                  <p className="text-lg font-semibold text-red-400">{severityCounts.critical}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🟠</span>
                <div>
                  <p className="text-xs text-slate-500">High</p>
                  <p className="text-lg font-semibold text-orange-400">{severityCounts.high}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🟡</span>
                <div>
                  <p className="text-xs text-slate-500">Medium</p>
                  <p className="text-lg font-semibold text-yellow-400">{severityCounts.medium}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🟢</span>
                <div>
                  <p className="text-xs text-slate-500">Low</p>
                  <p className="text-lg font-semibold text-green-400">{severityCounts.low}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Simulation Prompt */}
        {!simulating && simulationStages.length === 0 && (
          <Card className="border-blue-600/50 bg-blue-950/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 mb-1">Run Production Simulation</h3>
                <p className="text-sm text-slate-400">
                  Generate realistic operational events and watch Incident Radar correlate them into incidents.
                </p>
              </div>
              <Button variant="primary" onClick={handleRunSimulation}>
                ▶ Run Simulation
              </Button>
            </div>
          </Card>
        )}

        {/* Simulation Progress */}
        {(simulating || simulationStages.length > 0) && (
          <Card className="bg-blue-950/20 border-blue-600/50">
            <div className="space-y-3">
              {simulationStages.map((stage, idx) => (
                <div key={idx} className="text-sm text-slate-300">
                  ✓ {stage}
                </div>
              ))}
              {simulating && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Running simulation...
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Critical Incident */}
        {criticalIncident && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">🔴 Critical Incident</h2>
            <IncidentCard incident={criticalIncident} highlighted={true} />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventVolumeChart />
          <ErrorRateChart />
        </div>

        {/* Other Incidents */}
        {otherIncidents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Active Incidents</h2>
            <div className="grid grid-cols-1 gap-4">
              {otherIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
