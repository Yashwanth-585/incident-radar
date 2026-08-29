import React from 'react';
import Link from 'next/link';
import { Incident } from '@/types';
import { Card, Badge } from '@/components/ui';
import { SeverityBadge } from './SeverityBadge';
import { ChevronRight } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  highlighted?: boolean;
}

export function IncidentCard({ incident, highlighted = false }: IncidentCardProps) {
  return (
    <Link href={`/incidents/${incident.id}`}>
      <Card
        elevated={highlighted}
        className={`cursor-pointer hover:border-slate-600 transition-all ${
          highlighted
            ? 'bg-blue-950/30 border-blue-800/50 ring-2 ring-blue-600/20'
            : 'hover:bg-slate-800/50'
        }`}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-100 mb-2">{incident.title}</h3>
              <p className="text-sm text-slate-400">{incident.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <Badge severity="info">{incident.id}</Badge>
            <Badge severity="info">
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </Badge>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Service</p>
              <p className="text-slate-200 font-medium">{incident.service}</p>
            </div>
            <div>
              <p className="text-slate-500">Confidence</p>
              <p className="text-slate-200 font-medium">{incident.confidence}%</p>
            </div>
            <div>
              <p className="text-slate-500">Time</p>
              <p className="text-slate-200 font-medium">
                {new Date(incident.startTime).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Events</p>
              <p className="text-slate-200 font-medium">{incident.correlatedEventCount}</p>
            </div>
          </div>

          {/* Correlated Services */}
          {incident.correlatedServices.length > 0 && (
            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Affected Services</p>
              <div className="flex flex-wrap gap-1">
                {incident.correlatedServices.map((service) => (
                  <Badge key={service} severity="high">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
