import React from 'react';
import { Card } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

interface DependencyGraphProps {
  services: Array<{ name: string; dependencies: string[] }>;
}

export function DependencyGraph({ services }: DependencyGraphProps) {
  // Simplified dependency representation
  const mainDependencies = [
    { from: 'Frontend', to: 'API Gateway' },
    { from: 'API Gateway', to: 'Payment API' },
    { from: 'API Gateway', to: 'Authentication API' },
    { from: 'Payment API', to: 'PostgreSQL' },
    { from: 'Payment API', to: 'Redis' },
    { from: 'Checkout API', to: 'PostgreSQL' },
  ];

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-100">Service Dependencies</h3>
        <div className="bg-slate-800/30 rounded p-6 overflow-x-auto">
          <div className="flex flex-col gap-6 min-w-max">
            {/* Simple ASCII-style dependency visualization */}
            <div className="space-y-4">
              {[
                { level: 'Frontend', next: 'API Gateway' },
                { level: 'API Gateway', next: 'Payment API / Auth API' },
                { level: 'Payment API', next: 'PostgreSQL / Redis' },
              ].map((layer, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-blue-900/30 border border-blue-800 rounded font-mono text-sm text-blue-300 whitespace-nowrap">
                    {layer.level}
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                  {idx < 2 && (
                    <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded font-mono text-sm text-slate-300 whitespace-nowrap">
                      {layer.next}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Simple text representation for details */}
            <div className="text-xs text-slate-400 space-y-2 pt-4 border-t border-slate-700">
              <p>
                <span className="text-slate-300 font-medium">Authentication API</span> connects to API Gateway
              </p>
              <p>
                <span className="text-slate-300 font-medium">Notification Service</span> connects to API Gateway
              </p>
              <p>
                <span className="text-slate-300 font-medium">Checkout API</span> depends on Payment API and PostgreSQL
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
