'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { Search, X } from 'lucide-react';

interface EventFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: { service?: string; severity?: string; source?: string }) => void;
  onReset: () => void;
}

export function EventFilters({ onSearch, onFilterChange, onReset }: EventFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [service, setService] = React.useState('');
  const [severity, setSeverity] = React.useState('');
  const [source, setSource] = React.useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = () => {
    onFilterChange({ service, severity, source });
  };

  const handleReset = () => {
    setSearchTerm('');
    setService('');
    setSeverity('');
    setSource('');
    onReset();
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [service, severity, source]);

  const services = [
    'payment-api',
    'authentication-api',
    'checkout-api',
    'api-gateway',
    'postgres-primary',
    'redis',
    'notification-service',
  ];

  const severities = ['critical', 'high', 'medium', 'low'];
  const sources = ['GitHub', 'AWS', 'Datadog', 'PostgreSQL', 'Application Logs', 'Kubernetes', 'Payments'];

  return (
    <Card className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none flex-1"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-2">Service</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 outline-none"
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-2">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 outline-none"
          >
            <option value="">All Severities</option>
            {severities.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-2">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 outline-none"
          >
            <option value="">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset button */}
      {(searchTerm || service || severity || source) && (
        <Button variant="ghost" onClick={handleReset} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      )}
    </Card>
  );
}
