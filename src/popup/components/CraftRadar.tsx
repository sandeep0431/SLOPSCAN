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
  const dimensions: { id: Category; label: string; icon: string }[] = [
    { id: 'surfaces', label: 'Surfaces', icon: '🎨' },
    { id: 'spacing', label: 'Spacing', icon: '📐' },
    { id: 'typography', label: 'Type', icon: '🔤' },
    { id: 'components', label: 'Components', icon: '🧩' },
    { id: 'copy', label: 'Copy', icon: '💬' },
  ];

  return (
    <div className="bg-surface-inset border border-border-subtle rounded-md p-2.5 space-y-2">
      <div className="flex items-center justify-between text-[10px] font-mono text-content-muted">
        <span className="uppercase tracking-wider font-semibold">Craft DNA Radar</span>
        <span>Balance Metric</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {dimensions.map((dim) => {
          const score = scores[dim.id] ?? 100;
          const isSelected = activeCategory === dim.id;

          let colorClass = 'text-emerald-400';
          let barBg = 'bg-emerald-500';
          if (score < 75) {
            colorClass = 'text-severity-high';
            barBg = 'bg-severity-high';
          } else if (score < 90) {
            colorClass = 'text-severity-medium';
            barBg = 'bg-severity-medium';
          }

          return (
            <button
              key={dim.id}
              onClick={() => onSelectCategory(isSelected ? 'all' : dim.id)}
              className={`p-1.5 rounded-xs border text-left transition-all ${
                isSelected
                  ? 'bg-surface-raised border-accent shadow-sm'
                  : 'bg-surface/50 border-border-subtle hover:border-border hover:bg-surface-raised'
              }`}
            >
              <div className="text-[10px] font-medium text-content-secondary truncate flex items-center gap-1">
                <span>{dim.icon}</span>
                <span className="truncate">{dim.label}</span>
              </div>
              <div className={`text-[12px] font-bold font-mono mt-0.5 ${colorClass}`}>
                {score}%
              </div>
              <div className="h-1 w-full bg-canvas rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

