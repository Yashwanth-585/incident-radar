import React from 'react';
import { Card } from '@/components/ui';

export interface SimulationStage {
  stage: string;
  percentage: number;
  events?: number;
}

interface SimulationProgressProps {
  stages: SimulationStage[];
  finalEventCount: number;
  candidateIncidents: number;
  confirmedIncidents: number;
}

export function SimulationProgress({
  stages,
  finalEventCount,
  candidateIncidents,
  confirmedIncidents,
}: SimulationProgressProps) {
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-100 mb-4">Simulation Progress</h3>

          {/* Stages */}
          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-slate-300">{stage.stage}</div>
                  <div className="text-xs text-slate-500">{stage.percentage}%</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                {stage.events !== undefined && (
                  <div className="text-xs text-slate-500 mt-1">{stage.events} events</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Total Events</div>
              <div className="text-lg font-semibold text-slate-100">{finalEventCount}</div>
            </div>
            <div className="bg-slate-800/50 rounded p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Candidates</div>
              <div className="text-lg font-semibold text-slate-100">{candidateIncidents}</div>
            </div>
            <div className="bg-blue-900/30 rounded p-3 text-center border border-blue-800">
              <div className="text-xs text-blue-400 mb-1">Confirmed</div>
              <div className="text-lg font-semibold text-blue-300">{confirmedIncidents}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
