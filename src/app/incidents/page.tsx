'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { IncidentCard } from '@/components/incidents';
import { Card, Button, LoadingState } from '@/components/ui';
import { getIncidents } from '@/lib/api';
import { Incident } from '@/types';
import { Filter } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'active' | 'resolved'>('all');

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

  const filtered = incidents.filter((incident) => {
    if (filter === 'critical') return incident.severity === 'critical';
    if (filter === 'active') return incident.status === 'active';
    if (filter === 'resolved') return incident.status === 'resolved';
    return true;
  });

  if (loading) {
    return (
      <Layout title="Incidents">
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout title="Incidents" subtitle="Prioritized operational incidents and alerts">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            {(['all', 'critical', 'active', 'resolved'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'ghost'}
                onClick={() => setFilter(f)}
                className="text-sm"
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </Card>

        {/* Incident list */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-slate-400">No incidents match the selected filter.</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
