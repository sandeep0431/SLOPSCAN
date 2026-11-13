import React from 'react';
import { Crosshair } from 'lucide-react';
import { Issue } from '../../types/index.ts';

interface FindingCardProps {
  issue: Issue;
  onInspect: (issue: Issue) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ issue, onInspect }) => {
  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-red-950/60 text-severity-high border border-red-800/40 text-[9px] font-mono font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-severity-high"></span>
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-950/60 text-severity-medium border border-amber-800/40 text-[9px] font-mono font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-severity-medium"></span>
            Improvement
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-blue-950/60 text-severity-low border border-blue-800/40 text-[9px] font-mono font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-severity-low"></span>
            Review
          </span>
        );
    }
  };

  return (
    <div className="bg-surface border border-border rounded-md p-3 hover:border-border-strong transition-colors">
      {/* Top row: Status Badge & Category */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {getSeverityBadge()}
          <span className="text-[10px] text-content-muted font-mono uppercase">
            {issue.category}
          </span>
        </div>

        {issue.section && (
          <span className="text-[10px] font-mono text-content-secondary truncate max-w-[130px] bg-canvas px-1.5 py-0.5 rounded-xs border border-border">
            {issue.section}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xs font-semibold text-content-primary mb-1">
        {issue.title}
      </h3>

      {/* Selector breadcrumb */}
      {issue.selector && (
        <div className="text-[10px] font-mono text-content-muted truncate mb-2">
          {issue.selector}
        </div>
      )}

      {/* Technical Evidence */}
      <div className="bg-canvas border border-border/80 rounded-xs p-2 mb-2 font-mono text-[10px] text-content-secondary leading-relaxed break-words">
        <span className="text-content-muted select-none">Evidence: </span>
        {issue.evidence}
      </div>

      {/* Action Recommendation */}
      <div className="text-[11px] text-content-secondary leading-snug mb-2.5">
        <span className="text-content-primary font-medium">Fix: </span>
        {issue.recommendation}
      </div>

      {/* Footer: Inspect Element button */}
      <div className="flex items-center justify-end pt-1 border-t border-border/40">
        <button
          onClick={() => onInspect(issue)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-content-primary bg-surface-raised hover:bg-surface-overlay border border-border rounded-xs transition-colors hover:text-white"
        >
          <Crosshair size={12} className="text-severity-low" />
          <span>Inspect Element</span>
        </button>
      </div>
    </div>
  );
};

