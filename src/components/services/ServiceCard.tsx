import React from 'react';
import { Service } from '@/types';
import { Card, Badge } from '@/components/ui';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const healthColors = {
    healthy: { bg: 'bg-green-900/30', border: 'border-green-800', icon: '🟢' },
    degraded: { bg: 'bg-yellow-900/30', border: 'border-yellow-800', icon: '🟡' },
    critical: { bg: 'bg-red-900/30', border: 'border-red-800', icon: '🔴' },
  };

  const colors = healthColors[service.health];

  return (
    <Card className={`${colors.bg} border-2 ${colors.border}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-100">{service.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{service.id}</p>
          </div>
          <Badge severity={service.health === 'critical' ? 'critical' : service.health === 'degraded' ? 'high' : 'low'}>
            {service.health.charAt(0).toUpperCase() + service.health.slice(1)}
          </Badge>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">Requests</p>
            <p className="text-slate-200 font-medium">{service.requestsPerMin.toLocaleString()}/min</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Error Rate</p>
            <p className="text-slate-200 font-medium">{service.errorRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Latency</p>
            <p className="text-slate-200 font-medium">{service.latency}ms</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Incidents</p>
            <p className="text-slate-200 font-medium">{service.activeIncidents}</p>
          </div>
        </div>

        {/* Dependencies */}
        {service.dependencies.length > 0 && (
          <div className="pt-2 border-t border-slate-600/30">
            <p className="text-xs text-slate-500 mb-2">Dependencies</p>
            <div className="flex flex-wrap gap-1">
              {service.dependencies.map((dep) => (
                <Badge key={dep} severity="info">
                  {dep.replace('svc-', '')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
