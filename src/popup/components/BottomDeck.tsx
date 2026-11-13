import React, { useState } from 'react';
import { Copy, Check, Download, Type, Palette, ArrowLeft } from 'lucide-react';
import { ScanResult } from '../../types/index.ts';
import { generateFixPrompt } from '../../engine/promptGenerator.ts';

interface BottomDeckProps {
  scanResult: ScanResult;
  activeView: 'audit' | 'type' | 'color' | 'fixplan';
  onToggleView: (view: 'audit' | 'type' | 'color' | 'fixplan') => void;
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
      {/* 1. Primary Action: Full Fix Prompt (Soothing Teal matching PreScan) */}
      <button
        onClick={handleCopyFullPrompt}
        className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
          copied
            ? 'bg-teal-700 text-white border-teal-500 shadow-sm'
            : 'bg-teal-800 hover:bg-teal-700 active:scale-[0.99] text-white border border-teal-600/60 shadow-md'
        }`}
      >
        {copied ? (
          <>
            <Check size={14} className="text-white" />
            <span>Copied Full Fix Prompt</span>
          </>
        ) : (
          <>
            <Copy size={13} className="text-teal-200" />
            <span>Full fix prompt</span>
          </>
        )}
      </button>

      {/* 2. Secondary Exploration Actions (Clean Neutral Controls) */}
      {activeView !== 'audit' ? (
        <button
          onClick={() => onToggleView('audit')}
          className="w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border bg-surface-inset hover:bg-surface-raised text-content-primary border-border-subtle"
        >
          <ArrowLeft size={13} className="text-teal-300" />
          <span>Back to Craft Findings</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* Typography Inspector */}
          <button
            onClick={() => onToggleView('type')}
            className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border bg-surface-inset hover:bg-surface-raised text-content-secondary hover:text-white border-border-subtle"
          >
            <Type size={12} className="text-content-muted" />
            <span>Typography</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-surface-raised text-content-muted font-mono">
              {scanResult.typography.distinctFamilies.length}
            </span>
          </button>

          {/* Color Intelligence Inspector */}
          <button
            onClick={() => onToggleView('color')}
            className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border bg-surface-inset hover:bg-surface-raised text-content-secondary hover:text-white border-border-subtle"
          >
            <Palette size={12} className="text-teal-400" />
            <span>Color System</span>
          </button>
        </div>
      )}

      {/* 3. Tertiary Action: Download JSON Report */}
      <button
        onClick={handleDownloadReport}
        className="w-full py-1.5 px-3 rounded-md text-[11px] font-medium text-content-muted hover:text-content-secondary flex items-center justify-center gap-1.5 hover:bg-surface-inset transition-colors"
      >
        {downloaded ? (
          <>
            <Check size={12} className="text-teal-300" />
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
