'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import {
  SeverityBadge,
  ConfidenceScore,
  EvidenceCard,
  IncidentTimeline,
  RecommendationCard,
} from '@/components/incidents';
import { EventTable } from '@/components/events';
import { Card, Button, LoadingState, Toast, Badge } from '@/components/ui';
import { getIncident, getEvents } from '@/lib/api';
import { Incident, Event } from '@/types';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadData();
  }, [incidentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incidentData, eventsData] = await Promise.all([
        getIncident(incidentId),
        getEvents(),
      ]);

      if (incidentData) {
        setIncident(incidentData);
        setEvents(
          eventsData.filter((e) => incidentData.eventIds.includes(e.id))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (id: string, action: string) => {
    setToast({
      message: `${action === 'execute' ? 'Rollback' : 'Ticket'} request queued — backend integration coming soon.`,
      type: 'info',
    });
  };

  if (loading || !incident) {
    return (
      <Layout title="Incident Investigation">
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout title="Incident Investigation">
      <div className="space-y-8">
        {/* Back button and header */}
        <div className="space-y-4">
          <Link
            href="/incidents"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Incidents
          </Link>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-100">{incident.title}</h1>

            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge severity={incident.severity} />
              <Badge severity="info">{incident.id}</Badge>
              <Badge severity="info">
                {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
              </Badge>
              <Badge severity="info">{incident.confidence}% Confidence</Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-100">Description</h3>
            <p className="text-slate-300">{incident.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500">Service</p>
                <p className="text-sm font-medium text-slate-200">{incident.service}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Started</p>
                <p className="text-sm font-medium text-slate-200">
                  {new Date(incident.startTime).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Correlated Events</p>
                <p className="text-sm font-medium text-slate-200">{incident.correlatedEventCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Affected Services</p>
                <p className="text-sm font-medium text-slate-200">
                  {incident.correlatedServices.length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Investigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card elevated>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-100 mb-4">AI Investigation</h3>

                  <div className="bg-slate-800/30 rounded p-4 border border-slate-700 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-100 mb-2">Likely Root Cause</p>
                        <p className="text-slate-300 text-sm">{incident.rootCause}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <ConfidenceScore confidence={incident.confidence} />
          </div>
        </div>

        {/* Evidence */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Evidence</h2>
          <div className="space-y-3">
            {incident.evidence.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Timeline</h2>
          <Card>
            <IncidentTimeline evidence={incident.evidence} />
          </Card>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Recommended Actions</h2>
          <div className="space-y-3">
            {incident.recommendations.map((rec, idx) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isPrimary={idx === 0}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>

        {/* Correlated Events */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Correlated Events</h2>
          <EventTable events={events} />
        </div>
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
