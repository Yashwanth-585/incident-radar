import React from 'react';
import { Card, LoadingState } from '@/components/ui';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  loading?: boolean;
}

export function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-slate-400">{label}</h3>
          {Icon && <Icon className="w-5 h-5 text-slate-500" />}
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-slate-100">{value}</div>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={`text-xs font-medium ${
                trend > 0 ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
