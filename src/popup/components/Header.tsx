import React from 'react';
import { RotateCw, LayoutGrid } from 'lucide-react';
import { PageSnapshot } from '../../types/index.ts';

interface HeaderProps {
  page?: PageSnapshot;
  isScanning: boolean;
  onRescan: () => void;
}

export const Header: React.FC<HeaderProps> = ({ page, isScanning, onRescan }) => {
  return (
    <header className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between select-none">
      <div className="flex items-center space-x-2">
        <div className="text-content-secondary flex items-center">
          <LayoutGrid size={14} className="text-content-muted" />
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="font-bold text-sm text-content-primary tracking-tight">
            SlopScan
          </span>
          <span className="text-[10px] text-content-muted font-mono">
            Craft Audit
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {page && (
          <div className="text-[11px] font-mono text-content-secondary max-w-[170px] truncate bg-surface-inset px-2 py-0.5 rounded-xs border border-border-subtle">
            {page.domain}
          </div>
        )}

        <button
          onClick={onRescan}
          disabled={isScanning}
          title="Rescan Page"
          className="p-1 rounded-sm text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors disabled:opacity-40"
        >
          <RotateCw size={13} className={isScanning ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
};
