import React from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';
import { PageSnapshot } from '../../types/index.ts';

interface HeaderProps {
  page?: PageSnapshot;
  isScanning: boolean;
  onRescan: () => void;
}

export const Header: React.FC<HeaderProps> = ({ page, isScanning, onRescan }) => {
  return (
    <header className="border-b border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-xs bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-black rounded-xs"></div>
          </div>
          <span className="font-mono text-xs font-bold tracking-wider text-content-primary">
            SLOPSCAN
          </span>
          <span className="text-[10px] text-content-muted font-mono uppercase">
            v0.1.0
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-content-secondary">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            ></span>
            <span>{isScanning ? 'AUDITING...' : 'LIVE TAB'}</span>
          </div>

          <button
            onClick={onRescan}
            disabled={isScanning}
            title="Rescan Page"
            className="p-1 rounded text-content-secondary hover:text-content-primary hover:bg-surface-raised transition-colors disabled:opacity-40"
          >
            <RotateCw size={13} className={isScanning ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <div className="truncate text-content-secondary font-mono max-w-[260px]">
          {page?.domain || 'Connecting to tab...'}
        </div>
        {page && (
          <div className="text-[10px] text-content-muted font-mono flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-400" />
            <span>Local Inspection</span>
          </div>
        )}
      </div>
    </header>
  );
};

