import React, { useState } from 'react';
import { Issue, Category } from '../../types/index.ts';
import { FindingCard } from './FindingCard.tsx';
import { Filter, Layers, CheckCircle2, Search, X } from 'lucide-react';

interface AuditTabProps {
  issues: Issue[];
  onInspect: (issue: Issue) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({ issues, onInspect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'priority' | 'section'>('priority');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { label: string; value: string }[] = [
    { label: `All Categories (${issues.length})`, value: 'all' },
    { label: `Surfaces (${issues.filter((i) => i.category === 'surfaces').length})`, value: 'surfaces' },
    { label: `Typography (${issues.filter((i) => i.category === 'typography').length})`, value: 'typography' },
    { label: `Spacing (${issues.filter((i) => i.category === 'spacing').length})`, value: 'spacing' },
    { label: `Icons (${issues.filter((i) => i.category === 'icons').length})`, value: 'icons' },
    { label: `Copy (${issues.filter((i) => i.category === 'copy').length})`, value: 'copy' },
    { label: `Components (${issues.filter((i) => i.category === 'components').length})`, value: 'components' },
    { label: `Layout (${issues.filter((i) => i.category === 'layout').length})`, value: 'layout' },
    { label: `Motion (${issues.filter((i) => i.category === 'motion').length})`, value: 'motion' },
  ];

  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory !== 'all' && issue.category !== (selectedCategory as Category)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchEvidence = issue.evidence.toLowerCase().includes(q);
      const matchSection = (issue.section || '').toLowerCase().includes(q);
      const matchSelector = (issue.selector || '').toLowerCase().includes(q);
      return matchTitle || matchEvidence || matchSection || matchSelector;
    }
    return true;
  });

  return (
    <div className="p-3 space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter findings by keyword, selector, or section..."
          className="w-full bg-surface border border-border text-content-primary text-[11px] rounded-xs pl-8 pr-7 py-1.5 focus:outline-none focus:border-border-strong placeholder:text-content-muted font-mono"
        />
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Controls Bar: Category Filter & Grouping Toggle */}
      <div className="flex items-center justify-between gap-2 pb-1">
        {/* Category Selector */}
        <div className="relative flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-surface border border-border text-content-primary text-[11px] rounded-xs px-2.5 py-1.5 appearance-none focus:outline-none focus:border-border-strong cursor-pointer font-mono"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-surface text-content-primary">
                {cat.label}
              </option>
            ))}
          </select>
          <Filter
            size={11}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
          />
        </div>

        {/* Group By Toggle */}
        <div className="flex items-center bg-surface border border-border rounded-xs p-0.5 text-[10px] font-mono">
          <button
            onClick={() => setGroupBy('priority')}
            className={`px-2 py-1 rounded-xs transition-colors ${
              groupBy === 'priority'
                ? 'bg-surface-raised text-content-primary font-medium'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setGroupBy('section')}
            className={`px-2 py-1 rounded-xs transition-colors flex items-center gap-1 ${
              groupBy === 'section'
                ? 'bg-surface-raised text-content-primary font-medium'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            <Layers size={10} />
            <span>Section</span>
          </button>
        </div>
      </div>

      {/* Findings List */}
      {filteredIssues.length === 0 ? (
        <div className="border border-border/80 rounded-md p-6 text-center bg-surface/50 my-6">
          <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2 opacity-80" />
          <h4 className="text-xs font-semibold text-content-primary mb-1">
            No matching findings
          </h4>
          <p className="text-[11px] text-content-secondary max-w-[260px] mx-auto leading-relaxed">
            {searchQuery
              ? `No findings match "${searchQuery}". Clear your search query to see all results.`
              : 'This does not guarantee the interface is without flaw, but no strong anti-pattern was detected here.'}
          </p>
        </div>
      ) : groupBy === 'priority' ? (
        <div className="space-y-2.5">
          {filteredIssues.map((issue) => (
            <FindingCard key={issue.id} issue={issue} onInspect={onInspect} />
          ))}
        </div>
      ) : (
        // Grouped by section
        <div className="space-y-4">
          {Array.from(new Set(filteredIssues.map((i) => i.section || 'General Content'))).map(
            (sectionName) => {
              const sectionIssues = filteredIssues.filter(
                (i) => (i.section || 'General Content') === sectionName
              );
              return (
                <div key={sectionName} className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-1">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-content-secondary">
                      {sectionName}
                    </span>
                    <span className="text-[9px] font-mono text-content-muted">
                      ({sectionIssues.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sectionIssues.map((issue) => (
                      <FindingCard key={issue.id} issue={issue} onInspect={onInspect} />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};
