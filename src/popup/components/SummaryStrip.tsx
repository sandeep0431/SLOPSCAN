import React from 'react';
import { AuditSummary } from '../../types/index.ts';

interface SummaryStripProps {
  summary: AuditSummary;
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({ summary }) => {
  return (
    <div className="bg-surface-raised border-b border-border px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* High Priority Count */}
        <div className="flex items-baseline space-x-1.5">
          <span className="font-mono text-sm font-bold text-severity-high">
            {String(summary.highPriorityCount).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-content-secondary font-medium">
            High
          </span>
        </div>

        {/* Medium Priority Count */}
        <div className="flex items-baseline space-x-1.5">
          <span className="font-mono text-sm font-bold text-severity-medium">
            {String(summary.mediumPriorityCount).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-content-secondary font-medium">
            Fixes
          </span>
        </div>

        {/* Review Count */}
        <div className="flex items-baseline space-x-1.5">
          <span className="font-mono text-sm font-bold text-severity-low">
            {String(summary.reviewCount).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-content-secondary font-medium">
            Review
          </span>
        </div>
      </div>

      {/* Discrete Audit Signal (Factual summary, never a huge hero) */}
      <div className="flex items-center space-x-2 pl-3 border-l border-border">
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest text-content-muted font-mono">
            Signal
          </div>
          <div className="font-mono text-xs font-semibold text-content-primary">
            {summary.auditSignal}
            <span className="text-[10px] text-content-muted font-normal">/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

