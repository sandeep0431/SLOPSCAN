import { ExtensionMessage } from '../types/index.ts';
import { collectPageSnapshot, collectVisibleElements } from './domCollector.ts';
import { detectSections } from './sectionDetector.ts';
import { inspectElementOnPage, clearInspectionOverlay, toggleSimulateFix } from './inspectorOverlay.ts';
import { runAudit } from '../engine/index.ts';

console.log('[SlopScan] Content script injected and active.');

/**
 * Rapid micro-scroll sweep that triggers lazy loading, IntersectionObservers,
 * and dynamic scroll-revealed sections before taking the DOM snapshot.
 */
async function triggerFullPageWakeup(): Promise<void> {
  const initialY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;

  if (docHeight > winHeight * 1.2) {
    const step1 = Math.min(docHeight * 0.45, 2500);
    const step2 = Math.min(docHeight, 6500);

    window.scrollTo({ top: step1, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 60));
    window.scrollTo({ top: step2, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 80));
    window.scrollTo({ top: initialY, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 40));
  }
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'SCAN_PAGE') {
    (async () => {
      try {
        await triggerFullPageWakeup();

        const page = collectPageSnapshot();
        const sections = detectSections();
        const elements = collectVisibleElements(sections);

        page.visibleElementsCount = elements.length;

        const scanResult = runAudit({
          page,
          sections,
          elements,
        });

        sendResponse({ type: 'SCAN_PAGE_SUCCESS', payload: scanResult });
      } catch (err: unknown) {
        console.error('[SlopScan] Scanning failed:', err);
        sendResponse({
          type: 'SCAN_PAGE_ERROR',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return true; // Keep message channel open for async response
  }

  if (message.type === 'INSPECT_ELEMENT') {
    inspectElementOnPage(message.selector, message.elementId, message.issue);
    sendResponse({ status: 'ok' });
    return false;
  }

  if (message.type === 'CLEAR_INSPECTION') {
    clearInspectionOverlay();
    sendResponse({ status: 'ok' });
    return false;
  }

  if (message.type === 'SIMULATE_FIX') {
    toggleSimulateFix(message.selector, message.elementId, message.ruleId, message.active);
    sendResponse({ status: 'ok' });
    return false;
  }

  return false;
});
