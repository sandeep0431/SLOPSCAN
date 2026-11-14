import { ExtensionMessage } from '../types/index.ts';
import { collectPageSnapshot, collectVisibleElements } from './domCollector.ts';
import { detectSections } from './sectionDetector.ts';
import { inspectElementOnPage, clearInspectionOverlay, toggleSimulateFix } from './inspectorOverlay.ts';
import { runAudit } from '../engine/index.ts';

console.log('[SlopScan] Content script injected and active.');

/**
 * Smoothly scrolls from current Y position to target Y with easeInOutQuad easing.
 */
function smoothScrollTo(toY: number, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const startY = window.scrollY;
    const distance = toY - startY;
    if (Math.abs(distance) < 5 || durationMs <= 0) {
      window.scrollTo(0, toY);
      resolve();
      return;
    }

    const startTime = performance.now();

    function easeInOutQuad(t: number): number {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const ease = easeInOutQuad(progress);

      window.scrollTo(0, Math.round(startY + distance * ease));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, toY);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/**
 * Creates a sleek, temporary glowing laser beam HUD at the top of the viewport
 * to visually communicate that SlopScan is actively auditing the page.
 */
function showScanningHUD(): () => void {
  const hud = document.createElement('div');
  hud.id = 'slopscan-scanning-hud';
  hud.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 3px;
    background: linear-gradient(90deg, #0d9488, #14b8a6, #2dd4bf, #06b6d4, #14b8a6);
    box-shadow: 0 0 16px rgba(20, 184, 166, 0.9), 0 0 32px rgba(6, 182, 212, 0.5);
    z-index: 2147483647;
    pointer-events: none;
    transition: opacity 0.3s ease;
  `;

  const badge = document.createElement('div');
  badge.id = 'slopscan-scanning-badge';
  badge.style.cssText = `
    position: fixed;
    top: 12px;
    right: 16px;
    background: rgba(9, 11, 16, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(20, 184, 166, 0.45);
    color: #2dd4bf;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 5px 12px;
    border-radius: 6px;
    z-index: 2147483647;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    transition: opacity 0.3s ease;
  `;
  badge.innerHTML = `
    <span style="width: 6px; height: 6px; border-radius: 50%; background: #2dd4bf; box-shadow: 0 0 8px #2dd4bf; display: inline-block;"></span>
    SCANNING CRAFT & ARCHITECTURE...
  `;

  try {
    document.documentElement.appendChild(hud);
    document.documentElement.appendChild(badge);
  } catch {
    // guarded
  }

  return () => {
    try {
      hud.style.opacity = '0';
      badge.style.opacity = '0';
      setTimeout(() => {
        hud.remove();
        badge.remove();
      }, 300);
    } catch {
      // guarded
    }
  };
}

/**
 * Smoothly scrolls through the entire webpage down and back up
 * so that lazy-loaded sections and dynamic components wake up smoothly,
 * providing a tactile, visual scanning sensation.
 */
async function triggerSmoothPageScan(): Promise<void> {
  const initialY = window.scrollY;
  const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  const winHeight = window.innerHeight;

  const hideHUD = showScanningHUD();

  try {
    if (docHeight > winHeight * 1.15) {
      // Smoothly glide down to the bottom
      const targetBottom = docHeight - winHeight;
      await smoothScrollTo(targetBottom, 650);

      // Brief micro-pause at the bottom so IntersectionObservers wake up
      await new Promise((r) => setTimeout(r, 120));

      // Smoothly glide back up to the user's initial scroll position
      await smoothScrollTo(initialY, 500);

      // Rest for a moment before taking snapshot
      await new Promise((r) => setTimeout(r, 80));
    } else {
      // Single viewport page: brief pause for the scanning HUD animation
      await new Promise((r) => setTimeout(r, 350));
    }
  } finally {
    hideHUD();
  }
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'SCAN_PAGE') {
    (async () => {
      try {
        await triggerSmoothPageScan();

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
