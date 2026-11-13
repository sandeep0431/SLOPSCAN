import type { Rule, ScanContext, Issue } from '../../types/index.ts';

// Helper to check if color has saturation (not purely white/black/gray/transparent)
function isSaturatedColor(colorStr: string): boolean {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') return false;
  // Match rgb or rgba: rgb(r, g, b)
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // If delta is significant and not extreme dark/light, it is colored
    const delta = max - min;
    return delta > 25 && max > 30 && min < 240;
  }
  // Hex colors
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
    return max - min > 25 && max > 30 && min < 240;
  }
  // Check common color names or hsl
  if (colorStr.includes('hsl(')) return true;
  return false;
}

// R001: Hue Gradient Backgrounds
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
        // Exclude small indicators/avatars
        if (el.rect.width < 20 || el.rect.height < 20) continue;

        // Check if it's text clip (handled by R002)
        const clip = el.computedStyle.backgroundClip || el.computedStyle.webkitBackgroundClip;
        if (clip === 'text') continue;

        // Flag if applied to cards, sections, or containers
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

// R002: Gradient Text
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
          selector: el.selector,
          section: el.sectionName || 'Typography',
          elementIds: [el.id],
        });
      }
    }
    return issues;
  },
};

// R003: Colored Glow
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

      // Parse box-shadow: X Y blur [spread] [color] OR color X Y blur [spread]
      const pxTokens = Array.from(shadow.matchAll(/(\d+)px/g)).map((m) => parseInt(m[1], 10));
      const blurVal = pxTokens.length >= 3 ? pxTokens[2] : (pxTokens.length === 2 ? 0 : 0);

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
          selector: el.selector,
          section: el.sectionName || 'Action',
          elementIds: [el.id],
        });
      }
    }
    return issues;
  },
};

// R004: Decorative Blurred Blob
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
            recommendation: 'Remove decorative blurred color blobs. Ground content on deliberate layout structures instead of ambient haze.',
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


// R005: Excessive Accent Usage
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
