import React from 'react';
import { TypographyAnalysis } from '../../types/index.ts';
import { Type, Sparkles, BookOpen } from 'lucide-react';

interface TypographyTabProps {
  typography: TypographyAnalysis;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({ typography }) => {
  const { distinctFamilies, distinctSizes, distinctWeights, recommendations } = typography;

  return (
    <div className="p-3 space-y-4 text-content-primary">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-border rounded-xs p-2.5">
          <div className="text-[10px] text-content-muted font-mono uppercase">
            Type Families
          </div>
          <div className="text-sm font-bold font-mono text-content-primary mt-0.5">
            {distinctFamilies.length} Active
          </div>
          <div className="text-[10px] text-content-secondary truncate mt-1">
            {distinctFamilies.slice(0, 2).join(', ') || 'System Default'}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xs p-2.5">
          <div className="text-[10px] text-content-muted font-mono uppercase">
            Size Ramp
          </div>
          <div className="text-sm font-bold font-mono text-content-primary mt-0.5">
            {distinctSizes.length} Distinct Sizes
          </div>
          <div className="text-[10px] text-content-secondary truncate mt-1">
            {distinctSizes.slice(0, 3).map((s) => s.size).join(', ')}
          </div>
        </div>
      </div>

      {/* Font Family Inventory */}
      <div className="bg-surface border border-border rounded-md p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-2">
          <Type size={13} className="text-severity-low" />
          <span>Active Typefaces</span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          {distinctFamilies.map((family, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2 py-1 bg-canvas border border-border/60 rounded-xs"
            >
              <span className="text-content-primary font-medium">{family}</span>
              <span className="text-[10px] text-content-muted">
                {idx === 0 ? 'Primary' : 'Secondary'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Scale Distribution */}
      <div className="bg-surface border border-border rounded-md p-3">
        <div className="text-xs font-semibold mb-2">Computed Size Ramp</div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
          {distinctSizes.slice(0, 10).map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-canvas border border-border/70 rounded-xs text-content-secondary"
            >
              {item.size} <span className="text-content-muted">({item.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Weight System */}
      <div className="bg-surface border border-border rounded-md p-3">
        <div className="text-xs font-semibold mb-2">Weight Distribution</div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
          {distinctWeights.map((w, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-canvas border border-border/70 rounded-xs text-content-secondary"
            >
              Weight {w.weight} <span className="text-content-muted">({w.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2.5 pt-1">
        <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-content-secondary">
          Typographic Refinement Direction
        </div>

        {/* 1. Preserve */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="text-[11px] font-semibold text-emerald-400 mb-1">
            1. Preserve Brand Identity
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {recommendations.preserve}
          </p>
        </div>

        {/* 2. Simplify */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="text-[11px] font-semibold text-amber-400 mb-1">
            2. Simplify Current System
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {recommendations.simplify}
          </p>
        </div>

        {/* 3. Suggested Pair */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-severity-low mb-1.5">
            <Sparkles size={12} />
            <span>3. Suggested Pairing ({recommendations.suggested.category})</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-canvas p-2 rounded-xs border border-border/80 mb-2">
            <div>
              <span className="text-content-muted">Display / H1: </span>
              <span className="text-content-primary font-semibold">
                {recommendations.suggested.headingFont}
              </span>
            </div>
            <div>
              <span className="text-content-muted">Body: </span>
              <span className="text-content-primary">
                {recommendations.suggested.bodyFont}
              </span>
            </div>
            {recommendations.suggested.monoFont && (
              <div>
                <span className="text-content-muted">Data / Code: </span>
                <span className="text-content-primary">
                  {recommendations.suggested.monoFont}
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {recommendations.suggested.reason}
          </p>
        </div>

        {/* 4. Alternative */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-content-secondary mb-1.5">
            <BookOpen size={12} />
            <span>4. Lightweight Alternative</span>
          </div>
          <div className="text-[11px] font-mono text-content-primary mb-1">
            {recommendations.alternative.headingFont} + {recommendations.alternative.bodyFont}
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {recommendations.alternative.reason}
          </p>
        </div>
      </div>
    </div>
  );
};

