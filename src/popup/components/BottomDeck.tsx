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

      {/* 2. Secondary Exploration Actions */}
      {activeView !== 'audit' ? (
        <button
          onClick={() => onToggleView('audit')}
          className="w-full py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border bg-surface-raised hover:bg-surface-overlay text-content-primary border-border"
        >
          <ArrowLeft size={13} className="text-accent-light" />
          <span>Back to Craft Findings</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* Typography Inspector */}
          <button
            onClick={() => onToggleView('type')}
            className="py-1.5 px-2.5 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border bg-surface-raised/70 hover:bg-surface-raised text-content-secondary hover:text-content-primary border-border"
          >
            <Type size={12} className="text-content-muted" />
            <span>Typography</span>
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-accent/30 text-accent-light font-mono font-bold">
              {scanResult.typography.distinctFamilies.length}
            </span>
          </button>

          {/* Color Intelligence Inspector */}
          <button
            onClick={() => onToggleView('color')}
            className="py-1.5 px-2.5 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border bg-surface-raised/70 hover:bg-surface-raised text-content-secondary hover:text-content-primary border-border"
          >
            <Palette size={12} className="text-cyan-400" />
            <span>Color System</span>
            {scanResult.colorSystem?.likelyBrandColors?.length > 0 && (
              <span
                className="w-2 h-2 rounded-full shrink-0 border border-white/40"
                style={{ backgroundColor: scanResult.colorSystem.likelyBrandColors[0].normalizedHex }}
                title="Preserved Brand Accent"
              />
            )}
          </button>
        </div>
      )}

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
