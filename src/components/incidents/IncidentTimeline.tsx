import React from 'react';
import { Evidence } from '@/types';

interface IncidentTimelineProps {
  evidence: Evidence[];
}

export function IncidentTimeline({ evidence }: IncidentTimelineProps) {
  const sortedEvidence = [...evidence].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getIcon = (index: number, total: number) => {
    const icons = ['🚀', '🗄️', '📈', '💥', '💳', '⚠️', '🔥'];
    return icons[index % icons.length];
  };

  return (
    <div className="space-y-0">
      {sortedEvidence.map((item, index) => (
        <div key={item.id} className="relative">
          {/* Timeline item */}
          <div className="flex gap-4 pb-8">
            {/* Timeline line and dot */}
            <div className="relative flex flex-col items-center">
              {/* Dot */}
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-blue-600 flex items-center justify-center text-lg z-10 relative">
                {getIcon(index, sortedEvidence.length)}
              </div>

              {/* Connecting line */}
              {index < sortedEvidence.length - 1 && (
                <div className="absolute top-10 left-5 w-0.5 h-12 bg-gradient-to-b from-blue-600/50 to-slate-700" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-100">{item.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                </div>
              </div>

              {/* Metric */}
              {item.metric && (
                <div className="bg-slate-800/50 rounded p-3 mb-2 text-sm">
                  <span className="text-slate-400">{item.metric.before}</span>
                  <span className="text-slate-600 mx-2">→</span>
                  <span className="text-slate-200 font-semibold">{item.metric.after}</span>
                </div>
              )}

              <div className="text-xs text-slate-500">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
