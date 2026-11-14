import type { Rule, ScanContext, Issue, ElementSnapshot } from '../../types/index.ts';

function cleanFontFamily(font: string): string {
  if (!font) return 'sans-serif';
  // Strip quotes and take primary family
  return font.split(',')[0].replace(/['"]/g, '').trim();
}

export const R020_TooManyFontFamilies: Rule = {
  id: 'R020',
  name: 'Too Many Font Families',
  category: 'typography',
  description: 'Flags interfaces declaring more than three distinct typeface families.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const families = new Set<string>();
    const familyToElements = new Map<string, string[]>();

    for (const el of context.elements) {
      if (!el.text || el.text.trim().length === 0) continue;
      const fam = cleanFontFamily(el.computedStyle.fontFamily);
      // Exclude icon fonts and code fonts
      if (/icon|symbol|fa-|material|glyph/i.test(fam)) continue;

      families.add(fam);
      if (!familyToElements.has(fam)) {
        familyToElements.set(fam, []);
      }
      familyToElements.get(fam)!.push(el.id);
    }

    if (families.size > 3) {
      const famList = Array.from(families);
      return [
        {
          id: 'issue-typo-r020',
          ruleId: 'R020',
          category: 'typography',
          title: 'Too Many Font Families',
          severity: 'medium',
          confidence: 'high',
          evidence: `Page renders ${families.size} distinct typeface families: ${famList.join(', ')}`,
          recommendation: 'Standardize on 1–2 font families (one primary brand/interface typeface and optionally one mono face for data/code).',
          section: 'Global Typography',
          elementIds: famList.flatMap((f) => familyToElements.get(f)?.slice(0, 2) || []),
        },
      ];
    }
    return [];
  },
};

export const R021_TooManyFontSizes: Rule = {
  id: 'R021',
  name: 'Too Many Font Sizes',
  category: 'typography',
  description: 'Detects a bloated typographic scale with more than 8 distinct font sizes.',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const sizeCounts = new Map<string, number>();
    for (const el of context.elements) {
      if (!el.text || el.text.trim().length === 0) continue;
      const size = el.computedStyle.fontSize;
      if (!size) continue;
      sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1);
    }

    // Filter out sizes that appear only once in obscure contexts
    const prominentSizes = Array.from(sizeCounts.entries())
      .filter(([, count]) => count >= 2)
      .map(([size]) => size);

    if (prominentSizes.length > 8) {
      return [
        {
          id: 'issue-typo-r021',
          ruleId: 'R021',
          category: 'typography',
          title: 'Uncalibrated Type Scale',
          severity: 'low',
          confidence: 'medium',
          evidence: `${prominentSizes.length} distinct font sizes active across body and headings: ${prominentSizes.slice(0, 7).join(', ')}...`,
          recommendation: 'Adopt a structured type ramp (e.g. 12px, 14px, 16px, 20px, 24px, 32px, 48px) rather than arbitrary pixel sizes.',
          section: 'Typography Scale',
          elementIds: [],
        },
      ];
    }
    return [];
  },
};

export const R024_UppercaseTrackedLabels: Rule = {
  id: 'R024',
  name: 'Long all-caps text',
  category: 'typography',
  description: 'Flags long runs of uppercase text or forced uppercase tracking that reduce reading speed.',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const allCapsElements: ElementSnapshot[] = [];
    for (const el of context.elements) {
      const text = (el.directText || el.text).trim();
      if (text.length >= 16) {
        const isUpper =
          el.computedStyle.textTransform === 'uppercase' ||
          (text === text.toUpperCase() && /[A-Z]/.test(text));

        if (isUpper) {
          allCapsElements.push(el);
        }
      }
    }

    if (allCapsElements.length > 0) {
      const sample = allCapsElements[0];
      const sampleText = (sample.directText || sample.text).trim();
      return [
        {
          id: 'issue-typo-r024',
          ruleId: 'R024',
          category: 'typography',
          title: 'Long all-caps text',
          severity: 'low',
          confidence: 'medium',
          evidence: `${sampleText.length} chars in all-caps: "${sampleText.slice(0, 30)}...". Long runs of uppercase text are harder and slower to read than sentence case.`,
          recommendation: 'Use sentence case for long text and reserve all caps for short labels or badges.',
          diff: {
            remove: `${sampleText.slice(0, 25)}... (all-caps);`,
            add: 'Convert to sentence case for comfortable reading;',
          },
          selector: sample.selector,
          section: sample.sectionName || 'Typography',
          elementIds: allCapsElements.map((e) => e.id),
        },
      ];
    }
    return [];
  },
};


// R023: Heavy Heading Overuse
export const R023_HeavyHeadingOveruse: Rule = {
  id: 'R023',
  name: 'Heavy Heading Overuse',
  category: 'typography',
  description: 'Flags interfaces where almost all headings exclusively use extreme heavy weights (700-900).',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const headings = context.elements.filter(
      (el) => /^h[1-6]$/i.test(el.tagName) || (parseFloat(el.computedStyle.fontSize) >= 20 && el.text.length > 0)
    );

    if (headings.length >= 4) {
      const heavyCount = headings.filter((h) => {
        const w = parseInt(h.computedStyle.fontWeight, 10);
        return w >= 700 || h.computedStyle.fontWeight === 'bold';
      }).length;

      if (heavyCount / headings.length >= 0.85) {
        return [
          {
            id: 'issue-typo-r023',
            ruleId: 'R023',
            category: 'typography',
            title: 'Heavy Heading Overuse',
            severity: 'low',
            confidence: 'medium',
            evidence: `${heavyCount} of ${headings.length} headings (>${Math.round((heavyCount / headings.length) * 100)}%) use maximum weight (700-900).`,
            recommendation: 'Use scale (font size) and spacing to establish hierarchy before relying on maximum font weights. Consider semi-bold (600) or medium (500) for subheadings.',
            selector: headings[0]?.selector,
            section: 'Typography Hierarchy',
            elementIds: headings.slice(0, 3).map((h) => h.id),
          },
        ];
      }
    }
    return [];
  },
};
