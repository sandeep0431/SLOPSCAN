import React from 'react';
import { Category } from '../../types/index.ts';

interface CraftRadarProps {
  scores: Record<Category, number>;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CraftRadar: React.FC<CraftRadarProps> = ({
  scores,
  activeCategory,
  onSelectCategory,
}) => {
  const dimensions: { id: Category; label: string }[] = [
    { id: 'surfaces', label: 'Surfaces' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'typography', label: 'Type' },
    { id: 'components', label: 'Geometry' },
    { id: 'copy', label: 'Copy' },
  ];

  return (
    <div className="bg-surface-inset border border-border-subtle rounded-md p-2 space-y-1.5 select-none">
      <div className="flex items-center justify-between text-[10px] font-mono text-content-muted">
        <span className="uppercase tracking-wider font-semibold">Craft Architecture Balance</span>
        <span>Standard 100</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {dimensions.map((dim) => {
          const score = scores[dim.id] ?? 100;
          const isSelected = activeCategory === dim.id;
          const isDeducted = score < 95;

          return (
            <button
              key={dim.id}
              onClick={() => onSelectCategory(isSelected ? 'all' : dim.id)}
              className={`py-1 px-1.5 rounded-sm border text-left transition-all ${
                isSelected
                  ? 'bg-surface-raised border-border-strong text-white'
                  : 'bg-surface/40 border-border-subtle hover:border-border-strong hover:bg-surface-raised text-content-secondary'
              }`}
            >
              <div className="text-[10px] font-medium truncate text-content-muted">
                {dim.label}
              </div>
              <div
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  isDeducted ? 'text-amber-300/90' : 'text-content-primary'
                }`}
              >
                {score}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
