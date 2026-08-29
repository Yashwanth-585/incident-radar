'use client';

import React, { useState } from 'react';
import { Event } from '@/types';
import { Card, Badge } from '@/components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface EventTableProps {
  events: Event[];
  searchTerm?: string;
  filters?: {
    service?: string;
    severity?: string;
    source?: string;
  };
}

export function EventTable({ events, searchTerm = '', filters = {} }: EventTableProps) {
  const [sortBy, setSortBy] = useState<'time' | 'severity'>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  let filtered = events.filter((event) => {
    if (searchTerm && !event.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.service && event.service !== filters.service) return false;
    if (filters.severity && event.severity !== filters.severity) return false;
    if (filters.source && event.source !== filters.source) return false;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let aVal: any = a[sortBy === 'time' ? 'timestamp' : 'severity'];
    let bVal: any = b[sortBy === 'time' ? 'timestamp' : 'severity'];

    if (sortBy === 'time') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (sortBy === 'severity') {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      aVal = severityOrder[aVal as any];
      bVal = severityOrder[bVal as any];
    }

    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (column: 'time' | 'severity') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }: { column: 'time' | 'severity' }) => {
    if (sortBy !== column) return <div className="w-4 h-4" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                <button
                  onClick={() => toggleSort('time')}
                  className="flex items-center gap-2 hover:text-slate-300"
                >
                  Timestamp
                  <SortIcon column="time" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Service</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Source</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Event</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                <button
                  onClick={() => toggleSort('severity')}
                  className="flex items-center gap-2 hover:text-slate-300"
                >
                  Severity
                  <SortIcon column="severity" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Incident</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map((event) => (
              <tr
                key={event.id}
                className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 text-slate-300">{event.service}</td>
                <td className="px-4 py-3 text-slate-400">{event.source}</td>
                <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{event.message}</td>
                <td className="px-4 py-3">
                  <Badge severity={event.severity}>
                    {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {event.incidentId ? (
                    <Badge severity="info">{event.incidentId}</Badge>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-400">
        Showing {Math.min(30, filtered.length)} of {filtered.length} events
      </div>
    </Card>
  );
}
