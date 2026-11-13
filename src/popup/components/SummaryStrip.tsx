import React from 'react';
import { AuditSummary } from '../../types/index.ts';
import { ChevronUp, ChevronDown, ListFilter, Layers } from 'lucide-react';
import { CraftRadar } from './CraftRadar.tsx';

interface SummaryStripProps {
  summary: AuditSummary;
  categories: { id: string; label: string; count: number }[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  currentIndex: number;
  totalFiltered: number;
  onPrev: () => void;
  onNext: () => void;
  viewMode: 'feed' | 'spatial';
  onToggleViewMode: (mode: 'feed' | 'spatial') => void;
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
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className="bg-surface px-4 pt-3 pb-2.5 border-b border-border space-y-2.5 select-none">
      {/* 1. Score & View Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-content-primary font-sans">
            {summary.auditSignal}
          </span>
          <span className="text-xs font-semibold text-content-muted">
            /100
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 uppercase tracking-wider font-bold ml-1">
            Grade A
          </span>
        </div>

        {/* View Mode Switcher: Focus Feed vs Spatial Section Map */}
        <div className="flex items-center bg-surface-inset border border-border-subtle rounded-xs p-0.5 text-[10px] font-mono">
          <button
            onClick={() => onToggleViewMode('feed')}
            title="Focus Feed View"
            className={`px-2 py-1 rounded-xs transition-all flex items-center gap-1 ${
              viewMode === 'feed'
                ? 'bg-accent text-white font-bold shadow-xs'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            <ListFilter size={10} />
            <span>Feed</span>
          </button>
          <button
            onClick={() => onToggleViewMode('spatial')}
            title="Spatial Section Map"
            className={`px-2 py-1 rounded-xs transition-all flex items-center gap-1 ${
              viewMode === 'spatial'
                ? 'bg-accent text-white font-bold shadow-xs'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            <Layers size={10} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 2. Severity Counts Row */}
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

      {/* 3. Craft DNA Radar Spectrum */}
      {summary.categoryScores && (
        <CraftRadar
          scores={summary.categoryScores}
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
        />
      )}

      {/* 4. Pagination Strip (Visible in Feed Mode) */}
      {viewMode === 'feed' && (
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
      )}

      {/* 5. Category Filter Chips */}
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
