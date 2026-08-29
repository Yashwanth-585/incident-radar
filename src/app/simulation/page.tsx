'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { SimulationCard, SimulationProgress, SimulationStage } from '@/components/simulation';
import { Card, LoadingState, Toast } from '@/components/ui';
import { getScenarios, runSimulation } from '@/lib/api';
import { Scenario } from '@/types';

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [stages, setStages] = useState<SimulationStage[]>([]);
  const [result, setResult] = useState<{
    finalEventCount: number;
    candidateIncidents: number;
    confirmedIncidents: number;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const data = await getScenarios();
      setScenarios(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScenario = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setRunning(true);
    setSelectedScenario(scenarioId);
    setStages([]);
    setResult(null);

    try {
      const simulationResult = await runSimulation(scenario);

      // Update stages as they progress
      setStages(simulationResult.stages);
      setResult({
        finalEventCount: simulationResult.finalEventCount,
        candidateIncidents: simulationResult.candidateIncidents,
        confirmedIncidents: simulationResult.confirmedIncidents,
      });

      setToast({
        message: `Simulation complete: ${simulationResult.confirmedIncidents} incidents detected`,
        type: 'success',
      });
    } catch (error) {
      setToast({
        message: 'Simulation failed',
        type: 'success',
      });
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Production Simulation">
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout
      title="Production Simulation"
      subtitle="Generate realistic operational events and watch Incident Radar correlate them into incidents."
    >
      <div className="space-y-8">
        {/* Scenario Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <SimulationCard
                key={scenario.id}
                scenario={scenario}
                onRun={handleRunScenario}
                isRunning={running && selectedScenario === scenario.id}
              />
            ))}
          </div>
        </div>

        {/* Simulation Progress */}
        {(running || result) && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Simulation Results</h2>
            {result && (
              <SimulationProgress
                stages={stages}
                finalEventCount={result.finalEventCount}
                candidateIncidents={result.candidateIncidents}
                confirmedIncidents={result.confirmedIncidents}
              />
            )}
            {running && stages.length === 0 && (
              <Card>
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Starting simulation...</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Information Card */}
        <Card className="bg-blue-950/20 border-blue-700">
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-300">About Simulations</h3>
            <p className="text-sm text-blue-200">
              Simulations generate synthetic operational events to demonstrate how Incident Radar
              correlates noisy signals into meaningful incidents. Each scenario creates realistic
              event cascades with various severity levels.
            </p>
            <ul className="text-sm text-blue-200 space-y-2">
              <li>
                <span className="font-medium">Payment Service Degradation:</span> Deployment triggers
                connection exhaustion and cascading failures
              </li>
              <li>
                <span className="font-medium">Database Failure:</span> Database CPU spike causes query
                timeouts and checkout failures
              </li>
              <li>
                <span className="font-medium">Memory Leak:</span> Memory growth leads to pod restarts
                and request failures
              </li>
              <li>
                <span className="font-medium">Noisy Environment:</span> Random low-severity alerts
                across the system
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Toast */}
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
