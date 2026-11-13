import React from 'react';
import { AuditSummary } from '../../types/index.ts';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SummaryStripProps {
  summary: AuditSummary;
  categories: { id: string; label: string; count: number }[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  currentIndex: number;
  totalFiltered: number;
  onPrev: () => void;
  onNext: () => void;
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({
  summary,
  categories,
  activeCategory,
  onSelectCategory,
  currentIndex,
  totalFiltered,
  onPrev,
  onNext,
}) => {
  return (
    <div className="bg-surface px-4 pt-3 pb-2.5 border-b border-border space-y-3 select-none">
      {/* Score Header Row */}
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold tracking-tight text-content-primary font-sans">
          {summary.auditSignal}
        </span>
        <span className="text-sm font-medium text-content-muted">
          /100
        </span>
      </div>

      {/* Severity Metric Row */}
      <div className="flex items-center space-x-2.5 text-[11px] font-mono font-medium">
        <span className="text-severity-high flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-severity-high"></span>
          Critical {summary.highPriorityCount}
        </span>
        <span className="text-content-muted">•</span>
        <span className="text-severity-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-severity-medium"></span>
          Major {summary.mediumPriorityCount}
        </span>
        <span className="text-content-muted">•</span>
        <span className="text-severity-low flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-severity-low"></span>
          Minor {summary.reviewCount}
        </span>
      </div>

      {/* Pagination Control Strip */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          onClick={onPrev}
          disabled={currentIndex <= 0}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-content-primary border border-border rounded-xs transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronUp size={12} />
          <span>Prev</span>
        </button>

        <span className="text-[11px] text-content-muted font-mono">
          {totalFiltered === 0 ? '0 found' : `${currentIndex + 1} of ${totalFiltered} shown`}
        </span>

        <button
          onClick={onNext}
          disabled={currentIndex >= totalFiltered - 1}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-content-primary border border-border rounded-xs transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <span>Next</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-accent text-white border border-accent-light shadow-sm'
                  : 'bg-surface-raised border border-border text-content-secondary hover:text-content-primary hover:border-border-strong'
              }`}
            >
              {cat.label} {cat.count}
            </button>
          );
        })}
      </div>
    </div>
  );
};
