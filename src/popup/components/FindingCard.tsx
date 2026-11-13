import React, { useState } from 'react';
import { Crosshair, Copy, Check, MousePointerClick } from 'lucide-react';
import { Issue } from '../../types/index.ts';

interface FindingCardProps {
  issue: Issue;
  index: number;
  onInspect: (issue: Issue) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ issue, index, onInspect }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSelector, setCopiedSelector] = useState(false);

  const handleCopySinglePrompt = async () => {
    const text = `### Issue: ${issue.title} (${issue.category.toUpperCase()})\nTarget: ${issue.selector || 'Element'}\nSection: ${issue.section || 'General'}\nEvidence: ${issue.evidence}\nFix: ${issue.recommendation}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySelector = async () => {
    if (!issue.selector) return;
    try {
      await navigator.clipboard.writeText(issue.selector);
      setCopiedSelector(true);
      setTimeout(() => setCopiedSelector(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'high':
        return {
          numBg: 'bg-severity-high text-black',
          pillBg: 'bg-red-500 text-black',
          label: 'CRITICAL',
        };
      case 'medium':
        return {
          numBg: 'bg-severity-medium text-black',
          pillBg: 'bg-amber-400 text-black',
          label: 'MAJOR',
        };
      case 'low':
      default:
        return {
          numBg: 'bg-severity-low text-black',
          pillBg: 'bg-sky-400 text-black',
          label: 'MINOR',
        };
    }
  };

  const badge = getSeverityBadge();

  return (
    <div className="bg-surface border border-border rounded-md p-3.5 shadow-card hover:border-border-strong transition-all">
      {/* Top Badge Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {/* Number Circle */}
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${badge.numBg}`}
          >
            {index + 1}
          </span>

          {/* Severity Tag */}
          <span
            className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase ${badge.pillBg}`}
          >
            {badge.label}
          </span>

          {/* Category Tag */}
          <span className="px-1.5 py-0.5 rounded-xs bg-surface-raised border border-border-subtle text-[9px] font-mono font-medium text-content-secondary uppercase">
            {issue.category}
          </span>
        </div>

        {issue.section && (
          <span className="text-[10px] font-mono text-content-muted bg-surface-inset px-2 py-0.5 rounded-xs border border-border-subtle truncate max-w-[140px]">
            {issue.section}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-bold text-content-primary mb-2.5 tracking-tight">
        {issue.title}
      </h3>

      {/* Inset Metric / Evidence Box */}
      <div className="bg-surface-inset border border-border-subtle rounded-sm p-3 mb-3 text-[11px] leading-relaxed">
        {/* Monospace Metric / Value Line */}
        <div className="font-mono text-severity-low font-semibold mb-2 break-all text-[11px]">
          {issue.evidence.length > 90 ? issue.evidence.slice(0, 90) + '...' : issue.evidence}
        </div>

        {/* Hairline Divider */}
        <div className="border-t border-border-subtle my-2"></div>

        {/* Prescribed Fix */}
        <div className="text-content-secondary mb-1.5 text-[11px]">
          <span className="text-severity-mint font-semibold">Fix: </span>
          <span>{issue.recommendation}</span>
        </div>

        {/* Target Selector */}
        {issue.selector && (
          <div className="font-mono text-[10px] text-content-muted truncate mt-1">
            Target: <span className="text-content-secondary">{issue.selector}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopySinglePrompt}
            title="Copy fix instructions for this issue"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-content-primary border border-border rounded-xs transition-colors"
          >
            {copiedPrompt ? <Check size={11} className="text-severity-mint" /> : <Copy size={11} />}
            <span>{copiedPrompt ? 'Copied' : 'Fix prompt'}</span>
          </button>

          {issue.selector && (
            <button
              onClick={handleCopySelector}
              title="Copy element CSS selector"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-content-primary border border-border rounded-xs transition-colors"
            >
              {copiedSelector ? <Check size={11} className="text-severity-mint" /> : <MousePointerClick size={11} />}
              <span>{copiedSelector ? 'Copied' : 'Selector'}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onInspect(issue)}
          title="Highlight and spotlight element on live page"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-content-primary bg-surface-raised hover:bg-accent hover:text-white border border-border hover:border-accent rounded-xs transition-all"
        >
          <Crosshair size={12} className="text-severity-low" />
          <span>Inspect</span>
        </button>
      </div>
    </div>
  );
};
