import React, { useState } from 'react';
import { Issue } from '../../types/index.ts';
import { FindingCard } from './FindingCard.tsx';
import { ChevronRight, ChevronDown, Layers } from 'lucide-react';

interface SectionMapViewProps {
  issues: Issue[];
  onInspect: (issue: Issue) => void;
  onSimulateFix?: (issue: Issue, active: boolean) => void;
}

export const SectionMapView: React.FC<SectionMapViewProps> = ({
  issues,
  onInspect,
  onSimulateFix,
}) => {
  // Group issues by section
  const sectionGroups = React.useMemo(() => {
    const map = new Map<string, Issue[]>();
    for (const issue of issues) {
      const sec = issue.section || 'General Interface';
      if (!map.has(sec)) {
        map.set(sec, []);
      }
      map.get(sec)!.push(issue);
    }
    return Array.from(map.entries()).map(([section, items]) => ({
      section,
      issues: items,
      hasCritical: items.some((i) => i.severity === 'high'),
      hasMajor: items.some((i) => i.severity === 'medium'),
    }));
  }, [issues]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [sectionGroups[0]?.section || '']: true,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  };

  return (
    <div className="p-3.5 space-y-3 select-none">
      <div className="flex items-center justify-between text-[11px] font-mono text-content-muted pb-1">
        <span className="flex items-center gap-1.5 uppercase font-semibold">
          <Layers size={12} className="text-accent-light" />
          Spatial Section Hierarchy
        </span>
        <span>{sectionGroups.length} regions mapped</span>
      </div>

      <div className="space-y-2.5">
        {sectionGroups.map((group) => {
          const isExpanded = !!expandedSections[group.section];

          return (
            <div
              key={group.section}
              className="bg-surface border border-border rounded-md overflow-hidden shadow-card"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(group.section)}
                className="w-full px-3.5 py-2.5 bg-surface-raised/60 hover:bg-surface-raised flex items-center justify-between transition-colors border-b border-border/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-content-muted">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="text-xs font-bold text-content-primary font-mono uppercase tracking-wider">
                    {group.section}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {group.hasCritical && (
                    <span className="w-2 h-2 rounded-full bg-severity-high"></span>
                  )}
                  {group.hasMajor && (
                    <span className="w-2 h-2 rounded-full bg-severity-medium"></span>
                  )}
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-surface-inset border border-border-subtle text-content-secondary">
                    {group.issues.length} {group.issues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="p-3 space-y-3 bg-canvas/40">
                  {group.issues.map((issue, idx) => (
                    <FindingCard
                      key={issue.id}
                      issue={issue}
                      index={idx}
                      onInspect={onInspect}
                      onSimulateFix={onSimulateFix}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
