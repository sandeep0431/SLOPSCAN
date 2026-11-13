import React from 'react';
import { RotateCw, Sparkles, ArrowLeft } from 'lucide-react';
import { PageSnapshot } from '../../types/index.ts';

interface HeaderProps {
  page?: PageSnapshot;
  isScanning: boolean;
  onRescan: () => void;
  onBackToStart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ page, isScanning, onRescan, onBackToStart }) => {
  return (
    <header className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between select-none">
      <div className="flex items-center space-x-2">
        {onBackToStart && (
          <button
            onClick={onBackToStart}
            title="Back to Scan Launcher"
            className="p-1 rounded-sm text-content-muted hover:text-white hover:bg-surface-raised transition-colors mr-0.5"
          >
            <ArrowLeft size={13} />
          </button>
        )}

        <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-xs">
          <Sparkles size={11} className="text-white" />
        </div>

        <div className="flex items-baseline space-x-1.5">
          <span className="font-bold text-sm text-white tracking-tight">
            SlopScan
          </span>
          <span className="text-[10px] text-content-muted font-mono">
            Craft Audit
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {page && (
          <div className="text-[11px] font-mono text-content-secondary max-w-[150px] truncate bg-surface-inset px-2 py-0.5 rounded-sm border border-border-subtle">
            {page.domain}
          </div>
        )}

        <button
          onClick={onRescan}
          disabled={isScanning}
          title="Rescan Page"
          className="p-1.5 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors disabled:opacity-40"
        >
          <RotateCw size={12} className={isScanning ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
};
