import type { Rule, ScanContext, Issue } from '../../types/index.ts';

function isSaturatedColor(colorStr: string): boolean {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') return false;
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 50 || min > 240) return false;
    const delta = max - min;
    return delta > 30;
  }
  const hexMatch = colorStr.match(/#([0-9a-f]{3,8})/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 50 || min > 240) return false;
    return max - min > 30;
  }
  if (colorStr.includes('hsl(')) return true;
  return false;
}

export const R001_HueGradient: Rule = {
  id: 'R001',
  name: 'Hue Gradient',
  category: 'surfaces',
  description: 'Detects multi-hue or decorative gradient backgrounds on prominent interface elements.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const bg = el.computedStyle.backgroundImage;
      if (!bg || bg === 'none') continue;

      if (
        bg.includes('linear-gradient') ||
        bg.includes('radial-gradient') ||
        bg.includes('conic-gradient')
      ) {
        if (el.rect.width < 20 || el.rect.height < 20) continue;
        const clip = el.computedStyle.backgroundClip || el.computedStyle.webkitBackgroundClip;
        if (clip === 'text') continue;

        const isContainer = el.rect.width > 200 || el.rect.height > 100 || el.childrenCount > 1;
        if (isContainer) {
          issues.push({
            id: `issue-${el.id}-r001`,
            ruleId: 'R001',
            category: 'surfaces',
            title: 'Hue Gradient Background',
            severity: 'medium',
            confidence: 'high',
            evidence: `Element uses decorative gradient: ${bg.slice(0, 80)}...`,
            recommendation: 'Prefer quiet neutral surfaces. Reserve color and contrast for meaningful interaction boundaries.',
            diff: {
              remove: `background-image: ${bg.slice(0, 45)}...;`,
              add: 'background-color: #0F172A; border: 1px solid #1E293B;',
            },
            selector: el.selector,
            section: el.sectionName || 'Content',
            elementIds: [el.id],
          });
        }
      }
    }
    return issues;
  },
};

export const R002_GradientText: Rule = {
  id: 'R002',
  name: 'Gradient Text',
  category: 'surfaces',
  description: 'Detects text with gradient fills via background-clip: text.',
  defaultSeverity: 'high',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const clip = el.computedStyle.backgroundClip || el.computedStyle.webkitBackgroundClip;
      const bg = el.computedStyle.backgroundImage;
      if (clip === 'text' && bg && bg.includes('gradient')) {
        const textSample = el.directText || el.text.slice(0, 40);
        issues.push({
          id: `issue-${el.id}-r002`,
          ruleId: 'R002',
          category: 'surfaces',
          title: 'Gradient Text Treatment',
          severity: 'high',
          confidence: 'high',
          evidence: `Text "${textSample}" uses background-clip: text with ${bg.slice(0, 70)}...`,
          recommendation: 'Use solid, high-contrast text color. Gradient text reduces legibility and signals template-heavy aesthetics.',
          diff: {
            remove: '-webkit-background-clip: text; color: transparent;',
            add: 'color: #F8FAFC; font-weight: 700;',
          },
          selector: el.selector,
          section: el.sectionName || 'Typography',
          elementIds: [el.id],
        });
      }
    }
    return issues;
  },
};

export const R003_ColoredGlow: Rule = {
  id: 'R003',
  name: 'Colored Glow',
  category: 'surfaces',
  description: 'Detects saturated drop-shadows or box-shadows with large blur radius.',
  defaultSeverity: 'high',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const shadow = el.computedStyle.boxShadow;
      if (!shadow || shadow === 'none') continue;

      const pxTokens = Array.from(shadow.matchAll(/(\d+)px/g)).map((m) => parseInt(m[1], 10));
      const blurVal = pxTokens.length >= 3 ? pxTokens[2] : 0;

      if (blurVal >= 16 && isSaturatedColor(shadow)) {
        issues.push({
          id: `issue-${el.id}-r003`,
          ruleId: 'R003',
          category: 'surfaces',
          title: 'Excessive Colored Glow',
          severity: 'high',
          confidence: 'high',
          evidence: `Element exhibits saturated box-shadow glow with ${blurVal}px blur: "${shadow.slice(0, 70)}..."`,
          recommendation: 'Remove colored neon glow. Establish hierarchy through crisp contrast, subtle 1px border stroke, and spacing.',
          diff: {
            remove: `box-shadow: ${shadow.slice(0, 45)}...;`,
            add: 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); border: 1px solid #334155;',
          },
          selector: el.selector,
          section: el.sectionName || 'Action',
          elementIds: [el.id],
        });
      }
    }
    return issues;
  },
};

export const R004_BlurredBlob: Rule = {
  id: 'R004',
  name: 'Decorative Blurred Blob',
  category: 'surfaces',
  description: 'Detects large blurred background shapes or atmospheric light orbs.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const filter = el.computedStyle.filter || '';
      const isPos = el.computedStyle.position === 'absolute' || el.computedStyle.position === 'fixed';
      if (filter.includes('blur') && isPos) {
        const blurAmount = parseInt(filter.replace(/[^0-9]/g, ''), 10) || 0;
        if (blurAmount >= 30 && (el.rect.width > 80 || el.rect.height > 80)) {
          issues.push({
            id: `issue-${el.id}-r004`,
            ruleId: 'R004',
            category: 'surfaces',
            title: 'Decorative Blurred Blob',
            severity: 'medium',
            confidence: 'high',
            evidence: `Background decorative element with ${filter} positioned behind interface elements.`,
            recommendation: 'Remove decorative background blobs unless they serve a product-specific visual purpose.',
            diff: {
              remove: `filter: ${filter}; position: absolute;`,
              add: 'display: none;',
            },
            selector: el.selector,
            section: el.sectionName || 'Background',
            elementIds: [el.id],
          });
        }
      }
    }
    return issues;
  },
};

export const R005_ExcessiveAccentUsage: Rule = {
  id: 'R005',
  name: 'Excessive Accent Usage',
  category: 'surfaces',
  description: 'Flags overuse of saturated accent colors across unrelated interface elements.',
  defaultSeverity: 'medium',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const accentMap = new Map<string, { count: number; elements: string[]; selectors: string[] }>();

    for (const el of context.elements) {
      if (!el.isInteractive && el.tagName !== 'SPAN' && el.tagName !== 'DIV') continue;
      const bg = el.computedStyle.backgroundColor;
      if (bg && isSaturatedColor(bg)) {
        if (!accentMap.has(bg)) {
          accentMap.set(bg, { count: 0, elements: [], selectors: [] });
        }
        const data = accentMap.get(bg)!;
        data.count++;
        data.elements.push(el.id);
        if (data.selectors.length < 3 && el.selector) {
          data.selectors.push(el.selector);
        }
      }
    }

    const issues: Issue[] = [];
    for (const [color, data] of accentMap.entries()) {
      if (data.count >= 6) {
        issues.push({
          id: `issue-accent-r005`,
          ruleId: 'R005',
          category: 'surfaces',
          title: 'Excessive Accent Usage',
          severity: 'medium',
          confidence: 'medium',
          evidence: `The saturated accent color ${color} is repeated across ${data.count} distinct elements (${data.selectors.join(', ')}).`,
          recommendation: 'Treat accent color as a scarce visual currency. Reserve it for primary CTAs and critical status indicators.',
          diff: {
            remove: `background-color: ${color};`,
            add: 'background-color: #1E293B; border: 1px solid #334155; color: #F8FAFC;',
          },
          selector: data.selectors[0],
          section: 'Global Surfaces',
          elementIds: data.elements,
        });
        break;
      }
    }
    return issues;
  },
};
