import React, { useState } from 'react';
import { Scan, Sparkles, Palette, Type, Layers, Zap, X, Shield } from 'lucide-react';

interface PreScanViewProps {
  onStartScan: (mode: 'full' | 'colors' | 'typography') => void;
  isScanning: boolean;
  pageUrl?: string;
  pageDomain?: string;
}

export const PreScanView: React.FC<PreScanViewProps> = ({
  onStartScan,
  isScanning,
  pageDomain,
}) => {
  const [auditType, setAuditType] = useState<'audit' | 'diff'>('audit');
  const [selectedFocus, setSelectedFocus] = useState<'craft' | 'colors' | 'typography'>('craft');
  const [showBanner, setShowBanner] = useState<boolean>(true);

  // Descriptions tailored for each audit mode
  const descriptions = {
    craft:
      'Scan for usability & consistency issues — type scale, font/colour/style consistency, layout and readability — highlighted right where they are. Complements the accessibility scan.',
    colors:
      "Analyze and calibrate the website's color system — preserves intentional brand identity, identifies competing accents, analyzes surface depth, and establishes semantic CSS tokens.",
    typography:
      'Audit typographic hierarchy, distinct typeface families, font scale jumps, and off-grid spacing values across all interface components.',
  };

  const handleScanClick = () => {
    if (isScanning) return;
    const mode = selectedFocus === 'colors' ? 'colors' : selectedFocus === 'typography' ? 'typography' : 'full';
    onStartScan(mode);
  };

  return (
    <div className="flex flex-col h-full justify-between bg-canvas text-content-primary select-none p-4">
      {/* 1. Top Section: Header & Mode Pills */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Coral/Teal Geometric Badge */}
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-xs">
              <Sparkles size={13} className="text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-base font-bold text-white tracking-tight">
                Usability & Craft
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pageDomain && (
              <span className="text-[10px] font-mono text-content-muted bg-surface px-2 py-0.5 rounded-sm border border-border-subtle truncate max-w-[150px]">
                {pageDomain}
              </span>
            )}
            <button
              onClick={() => window.close()}
              title="Close"
              className="text-content-muted hover:text-content-primary transition-colors p-1 rounded-sm"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Row 1: High-Level Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-surface-inset p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setAuditType('audit')}
            className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              auditType === 'audit'
                ? 'bg-surface-raised text-white border border-border-strong shadow-xs'
                : 'text-content-secondary hover:text-white'
            }`}
          >
            <Layers size={13} className={auditType === 'audit' ? 'text-cyan-400' : 'text-content-muted'} />
            <span>Design Audit</span>
          </button>

          <button
            onClick={() => setAuditType('diff')}
            className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              auditType === 'diff'
                ? 'bg-surface-raised text-white border border-border-strong shadow-xs'
                : 'text-content-secondary hover:text-white'
            }`}
          >
            <Zap size={13} className={auditType === 'diff' ? 'text-amber-400' : 'text-content-muted'} />
            <span>Design Diff</span>
          </button>
        </div>

        {/* Row 2: Sub-Focus Category Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-surface-inset p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setSelectedFocus('craft')}
            className={`py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
              selectedFocus === 'craft'
                ? 'bg-surface-raised text-white border border-border-strong shadow-xs font-bold'
                : 'text-content-secondary hover:text-white'
            }`}
          >
            <Sparkles size={11} className={selectedFocus === 'craft' ? 'text-cyan-400' : 'text-content-muted'} />
            <span>Usability</span>
          </button>

          <button
            onClick={() => setSelectedFocus('colors')}
            className={`py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
              selectedFocus === 'colors'
                ? 'bg-surface-raised text-white border border-border-strong shadow-xs font-bold'
                : 'text-content-secondary hover:text-white'
            }`}
          >
            <Palette size={11} className={selectedFocus === 'colors' ? 'text-cyan-400' : 'text-content-muted'} />
            <span>Colors</span>
          </button>

          <button
            onClick={() => setSelectedFocus('typography')}
            className={`py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
              selectedFocus === 'typography'
                ? 'bg-surface-raised text-white border border-border-strong shadow-xs font-bold'
                : 'text-content-secondary hover:text-white'
            }`}
          >
            <Type size={11} className={selectedFocus === 'typography' ? 'text-cyan-400' : 'text-content-muted'} />
            <span>Typography</span>
          </button>
        </div>

        {/* Dynamic Mode Description */}
        <div className="pt-2">
          <p className="text-[12px] text-content-secondary leading-relaxed font-sans">
            {descriptions[selectedFocus]}
          </p>
        </div>

        {/* 2. Primary Scan CTA Button */}
        <div className="pt-3 flex items-center gap-2">
          <button
            onClick={handleScanClick}
            disabled={isScanning}
            className="flex-1 py-3 px-4 rounded-lg bg-teal-800 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-teal-600/60 shadow-md hover:shadow-teal-900/30 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>Auditing Live DOM...</span>
              </>
            ) : (
              <>
                <Scan size={14} className="text-teal-200" />
                <span>Scan Page</span>
              </>
            )}
          </button>

          {/* Privacy & Unlimited Local Badge */}
          <div
            title="100% Client-Side Local Scan • Zero Cloud Calls"
            className="py-2.5 px-3 rounded-lg bg-surface border border-border flex items-center gap-1.5 shrink-0 select-none"
          >
            <Shield size={12} className="text-teal-400" />
            <span className="text-[11px] font-mono font-bold text-content-primary">Local</span>
          </div>
        </div>

        {/* Feature Bullet Points */}
        <div className="pt-2 space-y-1.5 font-mono text-[10px] text-content-muted">
          <div className="flex items-center gap-1.5">
            <span className="text-teal-400 font-bold">•</span>
            <span>24 automated craft & color intelligence rules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-teal-400 font-bold">•</span>
            <span>Live in-page simulation & element spotlighting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-teal-400 font-bold">•</span>
            <span>Instant AI prompt generation with CSS tokens</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Beta Teaser Banner */}
      {showBanner && (
        <div className="pt-4 border-t border-border-subtle mt-4">
          <div className="flex items-center justify-between text-[11px] bg-surface-inset border border-border-subtle rounded-md px-3 py-2 text-content-secondary">
            <div className="flex items-center gap-2">
              <span className="truncate">Live In-Page Fix Simulator</span>
              <span className="px-1.5 py-0.2 rounded-xs bg-indigo-950/70 text-indigo-300 border border-indigo-800/40 text-[9px] font-bold uppercase tracking-wider shrink-0">
                BETA
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowBanner(false)}
                title="Dismiss"
                className="text-content-muted hover:text-content-primary p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
