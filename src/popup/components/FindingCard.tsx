import React, { useState } from 'react';
import { Crosshair, Copy, Check, MousePointerClick, Zap } from 'lucide-react';
import { Issue } from '../../types/index.ts';

interface FindingCardProps {
  issue: Issue;
  index: number;
  onInspect: (issue: Issue) => void;
  onSimulateFix?: (issue: Issue, active: boolean) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  issue,
  index,
  onInspect,
  onSimulateFix,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSelector, setCopiedSelector] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  const handleCopySinglePrompt = async () => {
    const text = `### Issue: ${issue.title} (${issue.category.toUpperCase()})\nTarget: ${issue.selector || 'Element'}\nSection: ${issue.section || 'General'}\nEvidence: ${issue.evidence}\nPrescribed Fix: ${issue.recommendation}${issue.diff ? `\n\nCode Diff:\n- ${issue.diff.remove}\n+ ${issue.diff.add}` : ''}`;
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

  const handleToggleSimulate = () => {
    const nextState = !isSimulated;
    setIsSimulated(nextState);
    if (onSimulateFix) {
      onSimulateFix(issue, nextState);
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
    <div className="bg-surface border border-border rounded-md p-3.5 shadow-card hover:border-border-strong transition-all space-y-3">
      {/* Top Badge Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${badge.numBg}`}
          >
            {index + 1}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase ${badge.pillBg}`}
          >
            {badge.label}
          </span>

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
      <h3 className="text-[13px] font-bold text-content-primary tracking-tight">
        {issue.title}
      </h3>

      {/* Inset Metric & Code Diff Box */}
      <div className="bg-surface-inset border border-border-subtle rounded-sm p-3 space-y-2 text-[11px] leading-relaxed">
        {/* Monospace Metric / Observed Value */}
        <div className="font-mono text-severity-low font-semibold break-all text-[11px]">
          {issue.evidence.length > 90 ? issue.evidence.slice(0, 90) + '...' : issue.evidence}
        </div>

        {/* Visual Code Diff (What competitor doesn't have!) */}
        {issue.diff && (
          <div className="bg-canvas border border-border-subtle/80 rounded-xs p-2 font-mono text-[10px] space-y-1">
            <div className="text-red-400 flex items-start gap-1">
              <span className="select-none font-bold shrink-0">-</span>
              <span className="truncate">{issue.diff.remove}</span>
            </div>
            <div className="text-emerald-400 flex items-start gap-1">
              <span className="select-none font-bold shrink-0">+</span>
              <span className="truncate">{issue.diff.add}</span>
            </div>
          </div>
        )}

        {/* Hairline Divider */}
        <div className="border-t border-border-subtle pt-1">
          <span className="text-severity-mint font-semibold">Fix: </span>
          <span className="text-content-secondary">{issue.recommendation}</span>
        </div>

        {/* Target Selector */}
        {issue.selector && (
          <div className="font-mono text-[10px] text-content-muted truncate pt-0.5">
            Target: <span className="text-content-secondary">{issue.selector}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border-subtle">
        <div className="flex items-center gap-1.5">
          {/* Live In-Page Fix Simulator Button */}
          <button
            onClick={handleToggleSimulate}
            title="Preview clean design live on the webpage"
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-xs border transition-all ${
              isSimulated
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-surface-raised hover:bg-surface-overlay text-content-secondary hover:text-content-primary border-border'
            }`}
          >
            <Zap size={11} className={isSimulated ? 'text-amber-400 fill-amber-400' : 'text-content-muted'} />
            <span>{isSimulated ? 'Revert' : 'Simulate'}</span>
          </button>

          {/* Fix prompt copy */}
          <button
            onClick={handleCopySinglePrompt}
            title="Copy fix prompt for this issue"
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-content-primary border border-border rounded-xs transition-colors"
          >
            {copiedPrompt ? <Check size={11} className="text-severity-mint" /> : <Copy size={11} />}
            <span>{copiedPrompt ? 'Copied' : 'Prompt'}</span>
          </button>

          {/* Selector copy */}
          {issue.selector && (
            <button
              onClick={handleCopySelector}
              title="Copy element CSS selector"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-content-secondary bg-surface-raised hover:bg-surface-overlay hover:text-content-primary border border-border rounded-xs transition-colors"
            >
              {copiedSelector ? <Check size={11} className="text-severity-mint" /> : <MousePointerClick size={11} />}
              <span>{copiedSelector ? 'Copied' : 'Selector'}</span>
            </button>
          )}
        </div>

        {/* Live Spotlight Inspect */}
        <button
          onClick={() => onInspect(issue)}
          title="Highlight and spotlight element on live page"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-content-primary bg-surface-raised hover:bg-accent hover:text-white border border-border hover:border-accent rounded-xs transition-all shadow-sm"
        >
          <Crosshair size={12} className="text-severity-low" />
          <span>Inspect</span>
        </button>
      </div>
    </div>
  );
};
