import React from 'react';
import { Scenario } from '@/types';
import { Card, Button } from '@/components/ui';
import { Play } from 'lucide-react';

interface SimulationCardProps {
  scenario: Scenario;
  onRun: (id: string) => void;
  isRunning?: boolean;
}

export function SimulationCard({ scenario, onRun, isRunning = false }: SimulationCardProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-100">{scenario.title}</h3>
          <p className="text-sm text-slate-400 mt-2">{scenario.description}</p>
        </div>

        <Button
          variant="primary"
          disabled={isRunning}
          onClick={() => onRun(scenario.id)}
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Scenario'}
        </Button>
      </div>
    </Card>
  );
}
