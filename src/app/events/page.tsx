'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { EventTable, EventFilters } from '@/components/events';
import { LoadingState } from '@/components/ui';
import { getEvents } from '@/lib/api';
import { Event } from '@/types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    service: '',
    severity: '',
    source: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Operational Events">
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout title="Operational Events" subtitle="Explore raw signals and event data across your infrastructure">
      <div className="space-y-6">
        <div className="text-sm text-slate-400">
          Total: <span className="font-medium text-slate-200">{events.length} events</span>
        </div>

        <EventFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          onReset={() => {
            setSearchTerm('');
            setFilters({ service: '', severity: '', source: '' });
          }}
        />

        <EventTable events={events} searchTerm={searchTerm} filters={filters} />
      </div>
    </Layout>
  );
}
