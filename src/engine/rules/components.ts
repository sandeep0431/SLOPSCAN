import type { Rule, ScanContext, Issue } from '../../types/index.ts';

function parseRadius(radiusStr: string): number {
  if (!radiusStr) return 0;
  const num = parseFloat(radiusStr);
  return isNaN(num) ? 0 : num;
}

export const R050_EverythingIsAPill: Rule = {
  id: 'R050',
  name: 'Everything Is a Pill',
  category: 'components',
  description: 'Detects excessive pill shapes (border-radius: 9999px or >= height/2) on standard cards, inputs, and containers.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const pillElements: { id: string; selector: string; section?: string }[] = [];

    for (const el of context.elements) {
      if (el.rect.width < 40 || el.rect.height < 20) continue;
      const r = parseRadius(el.computedStyle.borderRadius);
      const isPill = r >= 999 || (el.rect.height > 0 && r >= el.rect.height / 2 - 2);

      if (isPill) {
        if (el.tagName === 'IMG' && Math.abs(el.rect.width - el.rect.height) < 8) continue;
        pillElements.push({ id: el.id, selector: el.selector, section: el.sectionName });
      }
    }

    if (pillElements.length >= 6) {
      const sample = pillElements.slice(0, 3);
      return [
        {
          id: 'issue-comp-r050',
          ruleId: 'R050',
          category: 'components',
          title: 'Excessive Pill Components',
          severity: 'medium',
          confidence: 'high',
          evidence: `${pillElements.length} separate elements use extreme pill border radii (>= 9999px / 50% height).`,
          recommendation: 'Use restrained border radii (4px, 6px, or 8px) for structural containers and inputs. Reserve full pill geometry for standalone micro-tags.',
          diff: {
            remove: 'border-radius: 9999px; /* or rounded-full */',
            add: 'border-radius: 6px; /* restrained interactive radius */',
          },
          selector: sample[0]?.selector,
          section: sample[0]?.section || 'Components',
          elementIds: pillElements.map((p) => p.id),
        },
      ];
    }
    return [];
  },
};

export const R051_InconsistentRadiusSystem: Rule = {
  id: 'R051',
  name: 'Inconsistent Radius System',
  category: 'components',
  description: 'Flags interfaces with an uncoordinated mix of miscellaneous border radius values.',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const radii = new Set<number>();
    for (const el of context.elements) {
      if (el.rect.width < 30 || el.rect.height < 30) continue;
      const r = parseRadius(el.computedStyle.borderRadius);
      if (r > 0 && r < 50) {
        radii.add(r);
      }
    }

    if (radii.size >= 5) {
      const sorted = Array.from(radii).sort((a, b) => a - b);
      return [
        {
          id: 'issue-comp-r051',
          ruleId: 'R051',
          category: 'components',
          title: 'Chaotic Border Radius System',
          severity: 'low',
          confidence: 'medium',
          evidence: `Interface mixes ${radii.size} distinct border-radius values: ${sorted.map((r) => r + 'px').join(', ')}`,
          recommendation: 'Consolidate to a 2–3 tier radius token scale (e.g. 4px for controls, 8px for cards, 12px for modal panels).',
          diff: {
            remove: `border-radius: ${sorted.slice(0, 4).join('px, ')}px;`,
            add: 'border-radius: 6px (controls), 10px (cards);',
          },
          section: 'Design Tokens',
          elementIds: [],
        },
      ];
    }
    return [];
  },
};
