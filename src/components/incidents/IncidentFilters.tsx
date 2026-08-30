"use client";

import { Search, ArrowUpDown, Filter, X } from "lucide-react";

export interface IncidentFilterState {
  search: string;
  severity: string;
  status: string;
  service: string;
  sortBy: "severity-desc" | "severity-asc" | "time-desc" | "time-asc" | "confidence-desc";
}

export function IncidentFilters({
  filters,
  onChange,
  services,
  totalCount,
  filteredCount,
}: {
  filters: IncidentFilterState;
  onChange: (f: IncidentFilterState) => void;
  services: string[];
  totalCount: number;
  filteredCount: number;
}) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.severity !== "all" ||
    filters.status !== "all" ||
    filters.service !== "all";

  const handleReset = () => {
    onChange({
      search: "",
      severity: "all",
      status: "all",
      service: "all",
      sortBy: "severity-desc",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-md border border-[#27272a] bg-[#121216] px-3 py-1.5 flex-1 min-w-[200px] max-w-sm focus-within:border-zinc-700 transition-colors">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by ID, title, service..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none w-full"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={filters.severity}
            onChange={(e) => onChange({ ...filters, severity: e.target.value })}
            className="rounded-md border border-[#27272a] bg-[#121216] text-[13px] text-zinc-300 px-2.5 py-1.5 outline-none focus:border-zinc-700 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="rounded-md border border-[#27272a] bg-[#121216] text-[13px] text-zinc-300 px-2.5 py-1.5 outline-none focus:border-zinc-700 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Service Filter */}
        {services.length > 0 && (
          <div className="flex items-center gap-1.5">
            <select
              value={filters.service}
              onChange={(e) => onChange({ ...filters, service: e.target.value })}
              className="rounded-md border border-[#27272a] bg-[#121216] text-[13px] text-zinc-300 px-2.5 py-1.5 outline-none focus:border-zinc-700 hover:border-zinc-700 transition-colors cursor-pointer max-w-[170px]"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Order Selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs pl-1">
            <ArrowUpDown className="h-3 w-3 text-zinc-500" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as IncidentFilterState["sortBy"],
              })
            }
            className="rounded-md border border-violet-500/30 bg-[#121216] text-[13px] text-violet-300 font-medium px-2.5 py-1.5 outline-none focus:border-violet-500/60 hover:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="severity-desc">Severity: Critical → Low</option>
            <option value="severity-asc">Severity: Low → Critical</option>
            <option value="time-desc">Time: Newest first</option>
            <option value="time-asc">Time: Oldest first</option>
            <option value="confidence-desc">Confidence: Highest first</option>
          </select>
        </div>
      </div>

      {/* Filter status row */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-zinc-500 px-0.5">
          <span>
            Showing <strong className="text-zinc-300">{filteredCount}</strong> of{" "}
            <strong className="text-zinc-300">{totalCount}</strong> incidents
          </span>
          <button
            onClick={handleReset}
            className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 text-[11px]"
          >
            <X className="h-3 w-3" />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
