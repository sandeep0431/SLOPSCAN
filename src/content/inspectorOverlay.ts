import { Issue } from '../types/index.ts';

let activeOverlayContainer: HTMLDivElement | null = null;
let escapeListener: ((e: KeyboardEvent) => void) | null = null;

export function inspectElementOnPage(selector: string, elementId: string, issue: Issue): void {
  // Clear any existing overlay first
  clearInspectionOverlay();

  // Try locating element by data attribute first, then by selector
  let target: Element | null = document.querySelector(`[data-slopscan-id="${elementId}"]`);
  if (!target && selector) {
    try {
      target = document.querySelector(selector);
    } catch {
      // invalid selector fallback
    }
  }

  if (!target) {
    console.warn(`[SlopScan] Could not locate element for inspection:`, { selector, elementId });
    return;
  }

  // Scroll element into center of view
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });

  // Create isolated container
  const container = document.createElement('div');
  container.id = 'slopscan-inspector-host';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = `${Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)}px`;
  container.style.pointerEvents = 'none';
  container.style.zIndex = '2147483647';
  container.style.overflow = 'hidden';

  // Backdrop veil
  const backdrop = document.createElement('div');
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.width = '100vw';
  backdrop.style.height = '100vh';
  backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.25)';
  backdrop.style.pointerEvents = 'auto';
  backdrop.style.transition = 'opacity 200ms ease';
  backdrop.addEventListener('click', () => clearInspectionOverlay());
  container.appendChild(backdrop);

  // Highlighting Box
  const highlightBox = document.createElement('div');
  highlightBox.style.position = 'absolute';
  highlightBox.style.border = '2px solid #60A5FA';
  highlightBox.style.borderRadius = '4px';
  highlightBox.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.8), 0 4px 20px rgba(96, 165, 250, 0.4)';
  highlightBox.style.pointerEvents = 'none';
  highlightBox.style.transition = 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)';
  container.appendChild(highlightBox);

  // Annotation Card
  const annotationCard = document.createElement('div');
  annotationCard.style.position = 'absolute';
  annotationCard.style.width = '360px';
  annotationCard.style.backgroundColor = '#16181D';
  annotationCard.style.color = '#F1F3F5';
  annotationCard.style.border = '1px solid #3E4452';
  annotationCard.style.borderRadius = '8px';
  annotationCard.style.padding = '14px 16px';
  annotationCard.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.65)';
  annotationCard.style.fontFamily = 'Inter, -apple-system, sans-serif';
  annotationCard.style.fontSize = '12px';
  annotationCard.style.lineHeight = '1.5';
  annotationCard.style.pointerEvents = 'auto';

  const severityColor =
    issue.severity === 'high' ? '#F87171' : issue.severity === 'medium' ? '#FBBF24' : '#60A5FA';

  annotationCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${severityColor};"></span>
        <span style="font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; color: ${severityColor};">
          ${issue.confidence} CONFIDENCE
        </span>
        <span style="color: #6B7280; font-size: 10px;">• ${issue.category.toUpperCase()}</span>
      </div>
      <button id="slopscan-close-btn" style="background: transparent; border: none; color: #9CA3AF; cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 4px;">✕</button>
    </div>
    <div style="font-weight: 600; font-size: 13px; color: #FFFFFF; margin-bottom: 6px;">${escapeHtml(issue.title)}</div>
    <div style="background-color: #0D0E11; border: 1px solid #282C37; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px; font-family: monospace; font-size: 11px; color: #9CA3AF; word-break: break-all;">
      ${escapeHtml(issue.evidence)}
    </div>
    <div style="color: #D1D5DB; margin-bottom: 10px; font-size: 11px;">
      <strong style="color: #60A5FA;">Action:</strong> ${escapeHtml(issue.recommendation)}
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; pt: 8px; border-top: 1px solid #282C37; padding-top: 8px;">
      <button id="slopscan-copy-sel-btn" style="background: #1F222A; border: 1px solid #3E4452; color: #F1F3F5; border-radius: 4px; padding: 3px 8px; font-size: 10px; cursor: pointer; font-family: monospace;">
        Copy Selector
      </button>
      <span style="font-size: 10px; color: #6B7280;">Press [Esc] to dismiss</span>
    </div>
  `;

  container.appendChild(annotationCard);
  document.body.appendChild(container);
  activeOverlayContainer = container;

  // Geometry calculation
  const updateOverlayGeometry = () => {
    if (!target || !container.contains(highlightBox)) return;
    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    highlightBox.style.top = `${rect.top + scrollY - 4}px`;
    highlightBox.style.left = `${rect.left + scrollX - 4}px`;
    highlightBox.style.width = `${rect.width + 8}px`;
    highlightBox.style.height = `${rect.height + 8}px`;

    // Tooltip positioning
    let tooltipTop = rect.bottom + scrollY + 12;
    let tooltipLeft = rect.left + scrollX;

    // Flip to top if close to bottom of viewport
    if (rect.bottom + 240 > window.innerHeight && rect.top > 240) {
      tooltipTop = rect.top + scrollY - 210;
    }

    // Keep within horizontal bounds
    tooltipLeft = Math.max(16, Math.min(window.innerWidth - 380, tooltipLeft));

    annotationCard.style.top = `${tooltipTop}px`;
    annotationCard.style.left = `${tooltipLeft}px`;
  };

  updateOverlayGeometry();

  // Close handlers
  const closeBtn = annotationCard.querySelector('#slopscan-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearInspectionOverlay();
    });
  }

  // Copy Selector handler
  const copyBtn = annotationCard.querySelector('#slopscan-copy-sel-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selector) {
        navigator.clipboard.writeText(selector);
        copyBtn.textContent = 'Selector Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Selector';
        }, 2000);
      }
    });
  }

  escapeListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearInspectionOverlay();
    }
  };
  window.addEventListener('keydown', escapeListener);
  window.addEventListener('scroll', updateOverlayGeometry, { passive: true });
  window.addEventListener('resize', updateOverlayGeometry, { passive: true });
}

export function clearInspectionOverlay(): void {
  if (activeOverlayContainer && activeOverlayContainer.parentNode) {
    activeOverlayContainer.parentNode.removeChild(activeOverlayContainer);
  }
  activeOverlayContainer = null;
  if (escapeListener) {
    window.removeEventListener('keydown', escapeListener);
    escapeListener = null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// In-Page Live Fix Simulation State
const simulatedElementsMap = new Map<string, string>(); // elementId/selector -> original style attribute

export function toggleSimulateFix(
  selector: string,
  elementId: string,
  ruleId: string,
  active: boolean
): void {
  let target: HTMLElement | null = document.querySelector(`[data-slopscan-id="${elementId}"]`);
  if (!target && selector) {
    try {
      target = document.querySelector(selector);
    } catch {
      // fallback
    }
  }

  if (!target) return;

  const key = elementId || selector;

  if (active) {
    // Save original inline style if not already saved
    if (!simulatedElementsMap.has(key)) {
      simulatedElementsMap.set(key, target.getAttribute('style') || '');
    }

    // Apply clean craft override
    if (ruleId === 'R001') {
      target.style.backgroundImage = 'none';
      target.style.backgroundColor = '#1E293B';
      target.style.border = '1px solid #334155';
    } else if (ruleId === 'R002') {
      target.style.webkitBackgroundClip = 'unset';
      target.style.backgroundClip = 'unset';
      target.style.color = '#F8FAFC';
      target.style.fontWeight = '700';
    } else if (ruleId === 'R003') {
      target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
    } else if (ruleId === 'R004') {
      target.style.display = 'none';
    } else if (ruleId === 'R050') {
      target.style.borderRadius = '6px';
    } else if (ruleId === 'R070') {
      target.style.animation = 'none';
    }
  } else {
    // Restore original style
    if (simulatedElementsMap.has(key)) {
      const original = simulatedElementsMap.get(key) || '';
      target.setAttribute('style', original);
      simulatedElementsMap.delete(key);
    }
  }
}
