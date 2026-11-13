import React, { useState, useEffect, useCallback } from 'react';
import { ScanResult, Issue, ExtensionMessage } from '../types/index.ts';
import { Header } from './components/Header.tsx';
import { SummaryStrip } from './components/SummaryStrip.tsx';
import { AuditTab } from './components/AuditTab.tsx';
import { TypographyTab } from './components/TypographyTab.tsx';
import { FixPlanTab } from './components/FixPlanTab.tsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'type' | 'fixplan'>('audit');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const performScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Query active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error('No active browser tab found.');
      }

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
        throw new Error('Browser internal pages cannot be audited.');
      }

      // Try sending message to content script
      const sendScanMessage = (): Promise<ScanResult> => {
        return new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id!, { type: 'SCAN_PAGE' }, (response) => {
            if (chrome.runtime.lastError) {
              return reject(chrome.runtime.lastError);
            }
            if (response && response.type === 'SCAN_PAGE_SUCCESS') {
              resolve(response.payload);
            } else if (response && response.type === 'SCAN_PAGE_ERROR') {
              reject(new Error(response.error));
            } else {
              reject(new Error('Invalid response from content script.'));
            }
          });
        });
      };

      try {
        const result = await sendScanMessage();
        setScanResult(result);
      } catch {
        // If content script was not already loaded, inject it dynamically
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });

        // Small wait for injection initialization
        await new Promise((r) => setTimeout(r, 100));

        const result = await sendScanMessage();
        setScanResult(result);
      }
    } catch (err: unknown) {
      console.error('[SlopScan] Scan failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan webpage.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    performScan();
  }, [performScan]);

  const handleInspect = async (issue: Issue) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      const message: ExtensionMessage = {
        type: 'INSPECT_ELEMENT',
        selector: issue.selector || '',
        elementId: issue.elementIds[0] || '',
        issue,
      };

      chrome.tabs.sendMessage(tab.id, message);
    } catch (err) {
      console.warn('[SlopScan] Failed to send inspection message:', err);
    }
  };

  return (
    <div className="flex flex-col h-[580px] bg-canvas text-content-primary">
      {/* Sticky Header */}
      <Header
        page={scanResult?.page}
        isScanning={isScanning}
        onRescan={performScan}
      />

      {/* Loading Indicator Bar */}
      {isScanning && (
        <div className="h-0.5 w-full bg-surface-raised overflow-hidden">
          <div className="h-full bg-severity-low animate-pulse w-full"></div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-950/40 border-b border-red-800/50 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-severity-high mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-severity-high">Scan Halted</div>
            <div className="text-[11px] text-content-secondary mt-0.5">{error}</div>
            <button
              onClick={performScan}
              className="mt-2 text-[10px] font-mono text-content-primary underline hover:text-white flex items-center gap-1"
            >
              <RefreshCw size={10} /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      {scanResult ? (
        <>
          {/* Summary Strip: Factual Counts */}
          <SummaryStrip summary={scanResult.summary} />

          {/* Navigation Bar: AUDIT / TYPE / FIX PLAN */}
          <nav className="flex items-center border-b border-border bg-surface px-3">
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-3 text-[11px] font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'border-severity-low text-content-primary'
                  : 'border-transparent text-content-muted hover:text-content-secondary'
              }`}
            >
              <span>AUDIT</span>
              <span className="text-[10px] px-1 py-0.2 rounded-xs bg-surface-raised text-content-secondary">
                {scanResult.issues.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('type')}
              className={`py-2 px-3 text-[11px] font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'type'
                  ? 'border-severity-low text-content-primary'
                  : 'border-transparent text-content-muted hover:text-content-secondary'
              }`}
            >
              <span>TYPE</span>
              <span className="text-[10px] px-1 py-0.2 rounded-xs bg-surface-raised text-content-secondary">
                {scanResult.typography.distinctFamilies.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fixplan')}
              className={`py-2 px-3 text-[11px] font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'fixplan'
                  ? 'border-severity-low text-content-primary'
                  : 'border-transparent text-content-muted hover:text-content-secondary'
              }`}
            >
              <span>FIX PLAN</span>
            </button>
          </nav>

          {/* Scrollable View Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'audit' && (
              <AuditTab issues={scanResult.issues} onInspect={handleInspect} />
            )}
            {activeTab === 'type' && (
              <TypographyTab typography={scanResult.typography} />
            )}
            {activeTab === 'fixplan' && <FixPlanTab scanResult={scanResult} />}
          </div>
        </>
      ) : isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-severity-low animate-spin mb-3"></div>
          <div className="text-xs font-mono font-medium text-content-primary">
            Analyzing DOM & Computed Styles...
          </div>
          <div className="text-[11px] text-content-muted mt-1 max-w-[220px]">
            Extracting element geometry, typography scale, and layout sections.
          </div>
        </div>
      ) : null}
    </div>
  );
};

