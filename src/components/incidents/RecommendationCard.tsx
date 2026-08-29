import React from 'react';
import { Recommendation } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { Lightbulb } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  isPrimary?: boolean;
  onAction?: (id: string, action: string) => void;
}

export function RecommendationCard({
  recommendation,
  isPrimary = false,
  onAction,
}: RecommendationCardProps) {
  return (
    <Card
      elevated={isPrimary}
      className={`${isPrimary ? 'border-blue-600/50 ring-1 ring-blue-600/20' : ''}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-100">{recommendation.title}</h3>
                {isPrimary && (
                  <Badge severity="info" className="mt-2">
                    PRIMARY ACTION
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-slate-800/30 rounded p-3 border border-slate-700">
          <p className="text-sm text-slate-300">{recommendation.reason}</p>
        </div>

        {/* Action buttons */}
        {isPrimary && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => onAction?.(recommendation.id, 'execute')}
            >
              {recommendation.title.includes('Rollback') ? 'Rollback deployment' : 'Execute'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onAction?.(recommendation.id, 'ticket')}
            >
              Create incident ticket
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
