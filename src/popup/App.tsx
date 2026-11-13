import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScanResult, Issue, ExtensionMessage, Category } from '../types/index.ts';
import { Header } from './components/Header.tsx';
import { SummaryStrip } from './components/SummaryStrip.tsx';
import { AuditTab } from './components/AuditTab.tsx';
import { TypographyTab } from './components/TypographyTab.tsx';
import { BottomDeck } from './components/BottomDeck.tsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'audit' | 'type' | 'fixplan'>('audit');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const performScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error('No active browser tab found.');
      }

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
        throw new Error('Browser internal pages cannot be audited.');
      }

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
        // Inject content script if not loaded
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });

        await new Promise((r) => setTimeout(r, 120));
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

  // Compute Category counts
  const categoryFilters = useMemo(() => {
    if (!scanResult) return [];
    const counts: Record<string, number> = {};
    for (const issue of scanResult.issues) {
      counts[issue.category] = (counts[issue.category] || 0) + 1;
    }

    const list = [{ id: 'all', label: 'All', count: scanResult.issues.length }];
    const allCats: { id: Category; label: string }[] = [
      { id: 'surfaces', label: 'Surfaces' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'components', label: 'Components' },
      { id: 'icons', label: 'Icons' },
      { id: 'copy', label: 'Copy' },
      { id: 'layout', label: 'Layout' },
      { id: 'motion', label: 'Motion' },
    ];

    for (const c of allCats) {
      if (counts[c.id]) {
        list.push({ id: c.id, label: c.label, count: counts[c.id] });
      }
    }
    return list;
  }, [scanResult]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    if (!scanResult) return [];
    if (activeCategory === 'all') return scanResult.issues;
    return scanResult.issues.filter((i) => i.category === activeCategory);
  }, [scanResult, activeCategory]);

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(filteredIssues.length - 1, prev + 1));
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[600px] bg-canvas text-content-primary overflow-hidden">
      {/* 1. Header */}
      <Header
        page={scanResult?.page}
        isScanning={isScanning}
        onRescan={performScan}
      />

      {/* Loading Progress Bar */}
      {isScanning && (
        <div className="h-0.5 w-full bg-surface-raised overflow-hidden">
          <div className="h-full bg-accent animate-pulse w-full"></div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-red-950/40 border-b border-red-800/40 flex items-start gap-2">
          <AlertCircle size={14} className="text-severity-high mt-0.5 shrink-0" />
          <div className="flex-1 text-[11px]">
            <span className="font-semibold text-severity-high">Notice: </span>
            <span className="text-content-secondary">{error}</span>
            <button
              onClick={performScan}
              className="mt-1 block text-[10px] text-content-primary underline hover:text-white flex items-center gap-1"
            >
              <RefreshCw size={9} /> Retry Scan
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Content & Summary */}
      {scanResult ? (
        <>
          {/* Summary Strip: Score + Pagination + Category Chips */}
          <SummaryStrip
            summary={scanResult.summary}
            categories={categoryFilters}
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            currentIndex={currentIndex}
            totalFiltered={filteredIssues.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          {/* 3. Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto">
            {activeView === 'audit' ? (
              <AuditTab
                issues={filteredIssues}
                currentIndex={currentIndex}
                onInspect={handleInspect}
              />
            ) : (
              <TypographyTab typography={scanResult.typography} />
            )}
          </main>

          {/* 4. Bottom Action Deck */}
          <BottomDeck
            scanResult={scanResult}
            activeView={activeView}
            onToggleView={setActiveView}
          />
        </>
      ) : isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin mb-3"></div>
          <div className="text-xs font-semibold text-content-primary">
            Auditing Interface Craft...
          </div>
          <div className="text-[11px] text-content-muted mt-1 max-w-[220px]">
            Extracting computed styles, geometry, and design tokens.
          </div>
        </div>
      ) : null}
    </div>
  );
};
