import React from 'react';
import { Badge } from '@/components/ui';
import { Severity } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  showText?: boolean;
}

export function SeverityBadge({ severity, showText = true }: SeverityBadgeProps) {
  const labels = {
    critical: '🔴 Critical',
    high: '🟠 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };

  return <Badge severity={severity}>{showText ? labels[severity] : severity}</Badge>;
}

interface ConfidenceScoreProps {
  confidence: number;
  showPercentage?: boolean;
}

export function ConfidenceScore({ confidence, showPercentage = true }: ConfidenceScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-500 transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-100">{confidence}%</div>
          </div>
        </div>
      </div>
      {showPercentage && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-400">Confidence Score</p>
          <p className="text-lg font-medium text-blue-400">{confidence}%</p>
        </div>
      )}
    </div>
  );
}
