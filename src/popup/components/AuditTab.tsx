import React, { useRef, useEffect } from 'react';
import { Issue } from '../../types/index.ts';
import { FindingCard } from './FindingCard.tsx';
import { CheckCircle2 } from 'lucide-react';

interface AuditTabProps {
  issues: Issue[];
  currentIndex: number;
  onInspect: (issue: Issue) => void;
  onSimulateFix?: (issue: Issue, active: boolean) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  issues,
  currentIndex,
  onInspect,
  onSimulateFix,
}) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (cardRefs.current[currentIndex]) {
      cardRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  if (issues.length === 0) {
    return (
      <div className="p-6 text-center my-8 select-none">
        <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={20} className="text-emerald-400" />
        </div>
        <h4 className="text-xs font-bold text-content-primary mb-1">
          No matching findings
        </h4>
        <p className="text-[11px] text-content-secondary max-w-[240px] mx-auto leading-relaxed">
          No craft inconsistencies detected in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-3">
      {issues.map((issue, idx) => (
        <div
          key={issue.id}
          ref={(el) => { cardRefs.current[idx] = el; }}
          className={`transition-all rounded-lg ${
            idx === currentIndex ? 'border-border-strong' : ''
          }`}
        >
          <FindingCard
            issue={issue}
            index={idx}
            onInspect={onInspect}
            onSimulateFix={onSimulateFix}
          />
        </div>
      ))}
    </div>
  );
};
