import {
  PageSnapshot,
  ElementSnapshot,
  ComputedStyleSnapshot,
  SectionSnapshot,
  BoundingBox,
} from '../types/index.ts';
import { generateUniqueSelector } from './sectionDetector.ts';

const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'TEMPLATE',
  'PARAM',
  'SOURCE',
  'TRACK',
  'WBR',
  'HEAD',
  'META',
  'TITLE',
  'LINK',
  'CANVAS',
  'VIDEO',
  'AUDIO',
]);

const SVG_INNER_TAGS = new Set([
  'SVG',
  'PATH',
  'DEFS',
  'CLIPPATH',
  'G',
  'MASK',
  'USE',
  'LINE',
  'CIRCLE',
  'RECT',
  'POLYGON',
  'POLYLINE',
]);

/**
 * Resolves the true rendered background color by walking up the DOM tree
 * until finding a non-transparent background layer.
 */
export function resolveActualBackgroundColor(el: Element): string {
  let curr: Element | null = el;
  while (curr) {
    const style = window.getComputedStyle(curr);
    const bg = style.backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
      if (match) {
        const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
        if (alpha > 0.05) {
          return bg;
        }
      } else {
        return bg;
      }
    }
    curr = curr.parentElement;
  }

  // Fallback to body or document element background
  try {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
      return bodyBg;
    }
    const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
    if (htmlBg && htmlBg !== 'transparent' && htmlBg !== 'rgba(0, 0, 0, 0)') {
      return htmlBg;
    }
  } catch {
    // guarded
  }

  // Detect dark theme from body text color (if text is light/white/beige, canvas is dark)
  let hasLightBodyText = false;
  try {
    const bodyColor = window.getComputedStyle(document.body).color;
    const match = bodyColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (lum > 0.45) {
        hasLightBodyText = true;
      }
    }
  } catch {
    // guarded
  }

  const isDark =
    hasLightBodyText ||
    window.matchMedia('(prefers-color-scheme: dark)').matches ||
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    document.body.getAttribute('data-theme') === 'dark';

  return isDark ? 'rgb(11, 11, 11)' : 'rgb(255, 255, 255)';
}

export function collectPageSnapshot(): PageSnapshot {
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const totalElements = document.querySelectorAll('*').length;

  return {
    url: window.location.href,
    domain: window.location.hostname,
    title: document.title || window.location.hostname,
    metaDescription: metaDesc,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    },
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    totalElementsCount: totalElements,
    visibleElementsCount: 0,
    scannedAt: Date.now(),
  };
}

export function collectVisibleElements(sections: SectionSnapshot[]): ElementSnapshot[] {
  const elements: ElementSnapshot[] = [];
  const allNodes = document.body.querySelectorAll('*');
  const maxElements = 2500; // Expanded to cover full page scroll depth

  let scannedCount = 0;

  for (let i = 0; i < allNodes.length && scannedCount < maxElements; i++) {
    const el = allNodes[i];
    const tagName = el.tagName;

    if (IGNORED_TAGS.has(tagName) || SVG_INNER_TAGS.has(tagName)) {
      continue;
    }

    const rect = el.getBoundingClientRect();

    // Reject 0-size elements unless having visual children
    if (rect.width === 0 || rect.height === 0) continue;

    // Check style visibility
    const style = window.getComputedStyle(el);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      el.getAttribute('aria-hidden') === 'true'
    ) {
      continue;
    }

    // Direct text child extraction
    let directText = '';
    for (let c = 0; c < el.childNodes.length; c++) {
      const node = el.childNodes[c];
      if (node.nodeType === Node.TEXT_NODE) {
        directText += (node.textContent || '').trim() + ' ';
      }
    }
    directText = directText.trim();
    const fullText = (el.textContent || '').trim().replace(/\s+/g, ' ');

    const isInteractive =
      tagName === 'BUTTON' ||
      tagName === 'A' ||
      tagName === 'INPUT' ||
      tagName === 'SELECT' ||
      tagName === 'TEXTAREA' ||
      el.getAttribute('role') === 'button' ||
      el.getAttribute('role') === 'link' ||
      style.cursor === 'pointer';

    const scrollY = window.scrollY;
    const bbox: BoundingBox = {
      x: Math.round(rect.x),
      y: Math.round(rect.y + scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top + scrollY),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom + scrollY),
      left: Math.round(rect.left),
    };

    // Check for pseudo-elements (::before, ::after) often used for glowing borders and gradient haze
    let effectiveBgImage = style.backgroundImage;
    let effectiveBoxShadow = style.boxShadow;
    let effectiveFilter = style.filter;

    if (
      (!effectiveBgImage || effectiveBgImage === 'none') ||
      (!effectiveBoxShadow || effectiveBoxShadow === 'none')
    ) {
      try {
        const beforeStyle = window.getComputedStyle(el, '::before');
        if (beforeStyle.backgroundImage && beforeStyle.backgroundImage !== 'none') {
          effectiveBgImage = beforeStyle.backgroundImage;
        }
        if (beforeStyle.boxShadow && beforeStyle.boxShadow !== 'none') {
          effectiveBoxShadow = beforeStyle.boxShadow;
        }
        if (beforeStyle.filter && beforeStyle.filter !== 'none') {
          effectiveFilter = beforeStyle.filter;
        }

        const afterStyle = window.getComputedStyle(el, '::after');
        if (afterStyle.backgroundImage && afterStyle.backgroundImage !== 'none') {
          effectiveBgImage = afterStyle.backgroundImage;
        }
        if (afterStyle.boxShadow && afterStyle.boxShadow !== 'none') {
          effectiveBoxShadow = afterStyle.boxShadow;
        }
        if (afterStyle.filter && afterStyle.filter !== 'none') {
          effectiveFilter = afterStyle.filter;
        }
      } catch {
        // pseudo element security/parsing guard
      }
    }

    const computedStyleSnapshot: ComputedStyleSnapshot = {
      color: style.color,
      backgroundColor: style.backgroundColor,
      resolvedBackgroundColor: resolveActualBackgroundColor(el),
      backgroundImage: effectiveBgImage,
      backgroundClip: style.backgroundClip || (style as unknown as Record<string, string>)['-webkit-background-clip'] || '',
      webkitBackgroundClip: (style as unknown as Record<string, string>)['-webkit-background-clip'] || '',
      boxShadow: effectiveBoxShadow,
      filter: effectiveFilter,
      backdropFilter: style.backdropFilter || (style as unknown as Record<string, string>)['-webkit-backdrop-filter'] || '',
      opacity: style.opacity,

      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
      textDecoration: style.textDecoration,
      textShadow: style.textShadow,

      paddingTop: style.paddingTop,
      paddingRight: style.paddingRight,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      marginTop: style.marginTop,
      marginRight: style.marginRight,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft,
      gap: style.gap,

      borderRadius: style.borderRadius,
      borderWidth: style.borderWidth,
      borderStyle: style.borderStyle,
      borderColor: style.borderColor,

      display: style.display,
      position: style.position,
      zIndex: style.zIndex,
      flexDirection: style.flexDirection,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,

      animationName: style.animationName,
      animationDuration: style.animationDuration,
      animationIterationCount: style.animationIterationCount,
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
    };

    // Determine section membership
    const containingSection = sections.find((s) => {
      return (
        bbox.top >= s.rect.top - 10 &&
        bbox.bottom <= s.rect.bottom + 10
      );
    });

    const selector = generateUniqueSelector(el);
    const elementId = `el-${scannedCount + 1}`;

    // Tag DOM element with internal data attribute for instant lookup by inspector
    el.setAttribute('data-slopscan-id', elementId);

    elements.push({
      id: elementId,
      tagName,
      role: el.getAttribute('role') || undefined,
      selector,
      text: fullText.slice(0, 150),
      directText: directText.slice(0, 80),
      rect: bbox,
      computedStyle: computedStyleSnapshot,
      childrenCount: el.children.length,
      sectionId: containingSection?.id,
      sectionName: containingSection?.name,
      isInteractive,
    });

    scannedCount++;
  }

  return elements;
}

