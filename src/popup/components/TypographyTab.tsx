import React from 'react';
import { TypographyAnalysis } from '../../types/index.ts';
import { Type, Sparkles, ShieldCheck } from 'lucide-react';

interface TypographyTabProps {
  typography: TypographyAnalysis;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({ typography }) => {
  const { distinctFamilies, distinctSizes, distinctWeights, recommendations } = typography;

  return (
    <div className="p-3.5 space-y-3.5 select-none">
      {/* Header Stat Row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-border rounded-md p-3 shadow-card">
          <div className="text-[10px] text-content-muted font-mono uppercase tracking-wider">
            Type Families
          </div>
          <div className="text-xl font-extrabold text-content-primary mt-0.5">
            {distinctFamilies.length}
          </div>
          <div className="text-[10px] text-content-secondary truncate mt-0.5">
            {distinctFamilies.slice(0, 2).join(', ')}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-3 shadow-card">
          <div className="text-[10px] text-content-muted font-mono uppercase tracking-wider">
            Active Sizes
          </div>
          <div className="text-xl font-extrabold text-content-primary mt-0.5">
            {distinctSizes.length}
          </div>
          <div className="text-[10px] text-content-secondary truncate mt-0.5">
            Scale Range: {distinctSizes[distinctSizes.length - 1]?.size} – {distinctSizes[0]?.size}
          </div>
        </div>
      </div>

      {/* Active Typefaces */}
      <div className="bg-surface border border-border rounded-md p-3 shadow-card">
        <div className="flex items-center gap-1.5 text-xs font-bold text-content-primary mb-2">
          <Type size={13} className="text-accent-light" />
          <span>Active Typefaces</span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          {distinctFamilies.map((fam, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-1.5 bg-surface-inset border border-border-subtle rounded-xs"
            >
              <span className="text-content-primary font-semibold">{fam}</span>
              <span className="text-[10px] text-content-muted">
                {idx === 0 ? 'Primary' : 'Secondary'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Scale Distribution */}
      <div className="bg-surface border border-border rounded-md p-3 shadow-card">
        <div className="text-xs font-bold text-content-primary mb-2">
          Computed Type Ramp
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
          {distinctSizes.slice(0, 10).map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-surface-inset border border-border-subtle rounded-xs text-content-secondary"
            >
              {s.size} <span className="text-content-muted">({s.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Weight Distribution */}
      <div className="bg-surface border border-border rounded-md p-3 shadow-card">
        <div className="text-xs font-bold text-content-primary mb-2">
          Weight Hierarchy
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
          {distinctWeights.map((w, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-surface-inset border border-border-subtle rounded-xs text-content-secondary"
            >
              Weight {w.weight} <span className="text-content-muted">({w.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2 pt-1">
        <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-content-secondary">
          Typographic Strategy
        </div>

        {/* Preserve */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-severity-mint mb-1">
            <ShieldCheck size={12} />
            <span>1. Preserve Brand Identity</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {recommendations.preserve}
          </p>
        </div>

        {/* Simplify */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="text-[11px] font-bold text-amber-400 mb-1">
            2. Simplify Scale
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            {recommendations.simplify}
          </p>
        </div>

        {/* Suggested Pair */}
        <div className="bg-surface border border-border rounded-md p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent-light mb-1.5">
            <Sparkles size={12} />
            <span>3. Suggested Pairing ({recommendations.suggested.category})</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] bg-surface-inset p-2 rounded-xs border border-border-subtle mb-2">
            <div>
              <span className="text-content-muted">Headings: </span>
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
                <span className="text-content-muted">Data/Mono: </span>
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
      </div>
    </div>
  );
};
