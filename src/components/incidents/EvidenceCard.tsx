import React from 'react';
import { Evidence } from '@/types';
import { Card, Badge } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  return (
    <Card className="flex gap-4">
      {/* Icon */}
      <div className="flex-shrink-0 pt-1">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-900/30 border border-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-slate-100">{evidence.title}</h4>
            <p className="text-sm text-slate-400 mt-1">{evidence.description}</p>
          </div>
          <Badge severity={evidence.severity}>
            {evidence.source}
          </Badge>
        </div>

        {/* Metrics if available */}
        {evidence.metric && (
          <div className="bg-slate-800/50 rounded p-3 space-y-2">
            <div className="text-xs text-slate-400 font-medium">METRIC CHANGE</div>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-400 text-sm">{evidence.metric.before}</span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-200 font-semibold">{evidence.metric.after}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-slate-500">
          {new Date(evidence.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}
