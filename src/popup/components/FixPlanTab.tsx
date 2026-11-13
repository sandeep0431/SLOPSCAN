import React, { useState } from 'react';
import { ScanResult } from '../../types/index.ts';
import { generateFixPrompt } from '../../engine/promptGenerator.ts';
import { Copy, Check, Terminal, ExternalLink, Download } from 'lucide-react';

interface FixPlanTabProps {
  scanResult: ScanResult;
}

export const FixPlanTab: React.FC<FixPlanTabProps> = ({ scanResult }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const promptText = generateFixPrompt(scanResult);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scanResult, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `slopscan-${scanResult.page.domain}-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  };

  return (
    <div className="p-3 space-y-3">
      {/* Intro banner */}
      <div className="bg-surface border border-border rounded-md p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary">
            <Terminal size={13} className="text-severity-low" />
            <span>AI Coding Agent Fix Plan</span>
          </div>
          <span className="text-[10px] font-mono text-content-muted">
            Cursor / Claude Code / Codex
          </span>
        </div>
        <p className="text-[11px] text-content-secondary leading-relaxed mb-3">
          This prompt embeds concrete DOM evidence, exact CSS selectors, and non-destructive guardrails to guide AI coding assistants in executing visual cleanup without breaking business logic.
        </p>

        {/* Dual Actions: Copy Prompt & Export JSON */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2 px-3 rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-black hover:bg-neutral-200 active:scale-[0.99]'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Fix Plan</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            title="Download full JSON scan report"
            className="py-2 px-3 rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-1.5 bg-surface-raised hover:bg-surface-overlay border border-border text-content-secondary hover:text-content-primary transition-colors"
          >
            {downloaded ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code / Prompt Preview */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-content-muted">
          <span>PROMPT PREVIEW ({promptText.split('\n').length} lines)</span>
          <span className="flex items-center gap-1 text-content-secondary">
            <ExternalLink size={10} /> Ready for pasting
          </span>
        </div>

        <div className="bg-canvas border border-border rounded-md p-3 max-h-[290px] overflow-y-auto font-mono text-[10px] text-content-secondary leading-relaxed whitespace-pre-wrap select-text">
          {promptText}
        </div>
      </div>
    </div>
  );
};
