import React, { useState } from 'react';
import { Copy, Check, Download, Type } from 'lucide-react';
import { ScanResult } from '../../types/index.ts';
import { generateFixPrompt } from '../../engine/promptGenerator.ts';

interface BottomDeckProps {
  scanResult: ScanResult;
  activeView: 'audit' | 'type' | 'fixplan';
  onToggleView: (view: 'audit' | 'type' | 'fixplan') => void;
}

export const BottomDeck: React.FC<BottomDeckProps> = ({
  scanResult,
  activeView,
  onToggleView,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopyFullPrompt = async () => {
    try {
      const prompt = generateFixPrompt(scanResult);
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadReport = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scanResult, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `slopscan-${scanResult.page.domain}-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2200);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="p-3 bg-surface border-t border-border space-y-2 select-none shadow-lg">
      {/* 1. Primary Action: Full Fix Prompt */}
      <button
        onClick={handleCopyFullPrompt}
        className={`w-full py-2.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
          copied
            ? 'bg-emerald-600/90 text-white border-emerald-500 shadow-sm'
            : 'bg-accent/20 hover:bg-accent/30 text-white border-accent/60 hover:border-accent active:scale-[0.99] shadow-subtle'
        }`}
      >
        {copied ? (
          <>
            <Check size={14} className="text-white" />
            <span>Copied Full Fix Prompt</span>
          </>
        ) : (
          <>
            <Copy size={13} className="text-accent-light" />
            <span>Full fix prompt</span>
          </>
        )}
      </button>

      {/* 2. Secondary Action: Typography & Design Tokens */}
      <button
        onClick={() => onToggleView(activeView === 'type' ? 'audit' : 'type')}
        className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors border ${
          activeView === 'type'
            ? 'bg-surface-raised text-content-primary border-accent'
            : 'bg-surface-raised/70 hover:bg-surface-raised text-content-secondary hover:text-content-primary border-border'
        }`}
      >
        <Type size={13} className="text-content-muted" />
        <span>{activeView === 'type' ? '← Back to Findings' : 'Explore Typography & Tokens'}</span>
        {activeView !== 'type' && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/30 text-accent-light font-mono font-bold">
            {scanResult.typography.distinctFamilies.length} FAMILIES
          </span>
        )}
      </button>

      {/* 3. Tertiary Action: Download JSON Report */}
      <button
        onClick={handleDownloadReport}
        className="w-full py-1.5 px-3 rounded-md text-[11px] font-medium text-content-muted hover:text-content-secondary flex items-center justify-center gap-1.5 hover:bg-surface-raised transition-colors"
      >
        {downloaded ? (
          <>
            <Check size={12} className="text-severity-mint" />
            <span>Report Downloaded</span>
          </>
        ) : (
          <>
            <Download size={12} />
            <span>Download report</span>
          </>
        )}
      </button>
    </footer>
  );
};
