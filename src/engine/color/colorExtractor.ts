import type { ScanContext, ColorUsage, ElementSnapshot } from '../../types/index.ts';
import { parseAndNormalizeColor } from './colorNormalizer.ts';
import type { ParsedColor } from './colorNormalizer.ts';

// Extract colors from gradients: e.g. linear-gradient(135deg, rgb(5, 150, 105), #10B981 100%)
function extractColorsFromGradient(bgStr: string): string[] {
  if (!bgStr || !bgStr.includes('gradient')) return [];
  const found: string[] = [];

  // Match rgb/rgba
  const rgbMatches = bgStr.match(/rgba?\([^)]+\)/gi) || [];
  found.push(...rgbMatches);

  // Match hex
  const hexMatches = bgStr.match(/#[0-9a-f]{3,8}\b/gi) || [];
  found.push(...hexMatches);

  return found;
}

// Extract colors from box shadow
function extractColorsFromShadow(shadowStr: string): string[] {
  if (!shadowStr || shadowStr === 'none') return [];
  const found: string[] = [];

  const rgbMatches = shadowStr.match(/rgba?\([^)]+\)/gi) || [];
  found.push(...rgbMatches);

  const hexMatches = shadowStr.match(/#[0-9a-f]{3,8}\b/gi) || [];
  found.push(...hexMatches);

  return found;
}

export function extractPageColors(context: ScanContext): {
  usages: ColorUsage[];
  colorMap: Map<string, ParsedColor>;
  elementBackgroundMap: Map<string, ParsedColor>;
  elementColorMap: Map<string, ParsedColor>;
} {
  const usageMap = new Map<string, ColorUsage>();
  const parsedMap = new Map<string, ParsedColor>();
  const elementBackgroundMap = new Map<string, ParsedColor>();
  const elementColorMap = new Map<string, ParsedColor>();

  const registerColor = (
    rawColor: string,
    source: ColorUsage['source'],
    el: ElementSnapshot
  ) => {
    const parsed = parseAndNormalizeColor(rawColor);
    if (!parsed) return;

    // Discard completely transparent / invisible alpha
    if (parsed.a < 0.05) return;

    // Exclude icons, logos, brand badges, and media from being treated as primary interactive accent colors
    const isExcludedFromAccent =
      el.tagName === 'SVG' ||
      el.tagName === 'PATH' ||
      el.tagName === 'IMG' ||
      el.tagName === 'CANVAS' ||
      (el.selector && /(logo|avatar|brand-icon|star-icon|user-avatar|profile)/i.test(el.selector));

    const key = `${parsed.hex}-${source}`;
    parsedMap.set(parsed.hex, parsed);

    if (!usageMap.has(key)) {
      usageMap.set(key, {
        color: rawColor,
        normalizedHex: parsed.hex,
        source,
        frequency: 0,
        elementCount: 0,
        selectors: [],
        elementIds: [],
        sections: [],
        isInteractive: el.isInteractive && !isExcludedFromAccent,
        isSaturated: parsed.isSaturated,
        isNeutral: parsed.isNeutral,
        luminance: parsed.luminance,
        hueGroup: parsed.hueGroup,
      });
    }

    const usage = usageMap.get(key)!;
    usage.frequency++;
    if (!usage.elementIds.includes(el.id)) {
      usage.elementIds.push(el.id);
      usage.elementCount++;
    }
    if (el.selector && usage.selectors.length < 5 && !usage.selectors.includes(el.selector)) {
      usage.selectors.push(el.selector);
    }
    const secName = el.sectionName || 'General';
    if (!usage.sections.includes(secName)) {
      usage.sections.push(secName);
    }
  };

  for (const el of context.elements) {
    // 1. Text color
    if (el.text && el.text.trim().length > 0) {
      const textColor = el.computedStyle.color;
      if (textColor) {
        registerColor(textColor, 'text', el);
        const parsedText = parseAndNormalizeColor(textColor);
        if (parsedText) elementColorMap.set(el.id, parsedText);
      }
    }

    // 2. Background color (prefer resolved actual background color from DOM tree climb)
    const bgColor = el.computedStyle.resolvedBackgroundColor || el.computedStyle.backgroundColor;
    if (bgColor) {
      registerColor(bgColor, 'background', el);
      const parsedBg = parseAndNormalizeColor(bgColor);
      if (parsedBg) elementBackgroundMap.set(el.id, parsedBg);
    }

    // 3. Background gradients (skip logos, brand marks, and icons)
    const isBrandOrIcon =
      el.tagName === 'SVG' ||
      el.tagName === 'PATH' ||
      el.tagName === 'IMG' ||
      (el.selector && /(logo|avatar|brand-icon|star-icon)/i.test(el.selector));

    const bgImg = el.computedStyle.backgroundImage;
    if (!isBrandOrIcon && bgImg && bgImg.includes('gradient')) {
      const gradColors = extractColorsFromGradient(bgImg);
      for (const gc of gradColors) {
        registerColor(gc, 'gradient', el);
      }
    }

    // 4. Border color
    const borderColor = el.computedStyle.borderColor;
    if (borderColor && el.computedStyle.borderWidth && parseFloat(el.computedStyle.borderWidth) > 0) {
      registerColor(borderColor, 'border', el);
    }

    // 5. Box shadow
    const shadow = el.computedStyle.boxShadow;
    if (shadow && shadow !== 'none') {
      const shadowColors = extractColorsFromShadow(shadow);
      for (const sc of shadowColors) {
        registerColor(sc, 'shadow', el);
      }
    }
  }

  // Cluster nearly identical colors into family groups
  const usages = Array.from(usageMap.values()).sort((a, b) => b.frequency - a.frequency);

  return {
    usages,
    colorMap: parsedMap,
    elementBackgroundMap,
    elementColorMap,
  };
}
