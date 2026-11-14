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
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-white font-sans">
            {summary.auditSignal}
          </span>
          <span className="text-xs font-semibold text-content-muted">
            /100
          </span>
        </div>

        {/* View Mode Switcher: Focus Feed vs Spatial Section Map */}
        <div className="flex items-center bg-surface-inset border border-border-subtle rounded-md p-0.5 text-[10px] font-mono">
          <button
            onClick={() => onToggleViewMode('feed')}
            title="Focus Feed View"
            className={`px-2 py-1 rounded-sm transition-all flex items-center gap-1 ${
              viewMode === 'feed'
                ? 'bg-surface-raised text-white font-semibold border border-border-strong shadow-xs'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            <ListFilter size={11} />
            <span>Feed</span>
          </button>
          <button
            onClick={() => onToggleViewMode('spatial')}
            title="Spatial Section Map"
            className={`px-2 py-1 rounded-sm transition-all flex items-center gap-1 ${
              viewMode === 'spatial'
                ? 'bg-surface-raised text-white font-semibold border border-border-strong shadow-xs'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            <Layers size={11} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 2. Severity Counts Row (Calm, Muted Tones) */}
      <div className="flex items-center space-x-3 text-[11px] font-mono text-content-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80"></span>
          <span className={summary.highPriorityCount > 0 ? 'text-content-primary font-medium' : 'text-content-muted'}>
            Critical {summary.highPriorityCount}
          </span>
        </span>
        <span className="text-content-muted">•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
          <span className={summary.mediumPriorityCount > 0 ? 'text-content-primary font-medium' : 'text-content-muted'}>
            Major {summary.mediumPriorityCount}
          </span>
        </span>
        <span className="text-content-muted">•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span className={summary.reviewCount > 0 ? 'text-content-primary font-medium' : 'text-content-muted'}>
            Minor {summary.reviewCount}
          </span>
        </span>
      </div>

      {/* 3. Craft Architecture Balance Strip */}
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-white border border-border-subtle rounded-sm transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-white border border-border-subtle rounded-sm transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>Next</span>
            <ChevronDown size={12} />
          </button>
        </div>
      )}

      {/* 5. Category Filter Chips (Disciplined Neutral Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-surface-raised text-white border border-border-strong shadow-xs font-semibold'
                  : 'bg-surface-inset border border-border-subtle text-content-secondary hover:text-white'
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
