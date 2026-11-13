import type { Rule, ScanContext, Issue } from '../../types/index.ts';

const VALID_GRID_STEPS = new Set([0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]);

function parsePx(val: string): number {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : Math.round(num);
}

export const R011_ArbitrarySpacing: Rule = {
  id: 'R011',
  name: 'Arbitrary Spacing',
  category: 'spacing',
  description: 'Detects off-grid, arbitrary margin/padding values (e.g., 7px, 13px, 19px, 31px).',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    const arbitraryElements: { elId: string; selector: string; prop: string; val: number; section?: string }[] = [];

    for (const el of context.elements) {
      if (el.rect.width < 30 && el.rect.height < 30) continue; // Skip tiny elements

      const pTop = parsePx(el.computedStyle.paddingTop);
      const pRight = parsePx(el.computedStyle.paddingRight);
      const pBottom = parsePx(el.computedStyle.paddingBottom);
      const pLeft = parsePx(el.computedStyle.paddingLeft);

      const mTop = parsePx(el.computedStyle.marginTop);
      const mBottom = parsePx(el.computedStyle.marginBottom);

      const checkList = [
        { prop: 'padding-top', val: pTop },
        { prop: 'padding-bottom', val: pBottom },
        { prop: 'padding-left', val: pLeft },
        { prop: 'padding-right', val: pRight },
        { prop: 'margin-top', val: mTop },
        { prop: 'margin-bottom', val: mBottom },
      ];

      for (const item of checkList) {
        if (item.val > 5 && item.val < 100 && !VALID_GRID_STEPS.has(item.val)) {
          // If not divisible by 4 or 8
          if (item.val % 4 !== 0 && item.val % 8 !== 0) {
            arbitraryElements.push({
              elId: el.id,
              selector: el.selector,
              prop: item.prop,
              val: item.val,
              section: el.sectionName,
            });
            break;
          }
        }
      }
    }

    if (arbitraryElements.length >= 3) {
      const sample = arbitraryElements.slice(0, 3);
      const details = sample.map((s) => `${s.selector} (${s.prop}: ${s.val}px)`).join(', ');
      issues.push({
        id: `issue-spacing-r011`,
        ruleId: 'R011',
        category: 'spacing',
        title: 'Arbitrary Spacing Values',
        severity: 'low',
        confidence: 'medium',
        evidence: `Multiple elements use irregular spacing off the 4/8px grid scale: ${details}`,
        recommendation: 'Align spacing to a consistent mathematical scale (e.g. 4, 8, 12, 16, 24, 32, 48px) to establish visual rhythm.',
        selector: sample[0]?.selector,
        section: sample[0]?.section || 'Layout',
        elementIds: sample.map((s) => s.elId),
      });
    }

    return issues;
  },
};


// R012: Inconsistent Card Padding
export const R012_InconsistentCardPadding: Rule = {
  id: 'R012',
  name: 'Inconsistent Card Padding',
  category: 'spacing',
  description: 'Flags sibling cards or cards in the same section with uneven internal padding.',
  defaultSeverity: 'medium',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    const sectionCards = new Map<string, { id: string; selector: string; padding: string }[]>();

    for (const el of context.elements) {
      // Look for cards
      const isCard =
        (el.rect.width > 160 && el.rect.height > 80 && el.childrenCount >= 2) ||
        el.selector.includes('card');
      if (isCard) {
        const sec = el.sectionName || 'General';
        if (!sectionCards.has(sec)) {
          sectionCards.set(sec, []);
        }
        const pStr = `${el.computedStyle.paddingTop} ${el.computedStyle.paddingRight} ${el.computedStyle.paddingBottom} ${el.computedStyle.paddingLeft}`;
        sectionCards.get(sec)!.push({ id: el.id, selector: el.selector, padding: pStr });
      }
    }

    for (const [sec, cards] of sectionCards.entries()) {
      if (cards.length >= 2) {
        const firstPad = cards[0].padding;
        const mismatched = cards.filter((c) => c.padding !== firstPad);
        if (mismatched.length > 0 && mismatched.length < cards.length) {
          issues.push({
            id: `issue-card-pad-${sec}`,
            ruleId: 'R012',
            category: 'spacing',
            title: 'Inconsistent Card Padding',
            severity: 'medium',
            confidence: 'medium',
            evidence: `Cards in ${sec} section use conflicting padding values: "${firstPad}" vs "${mismatched[0].padding}".`,
            recommendation: 'Standardize card padding across sibling containers to create visual balance.',
            selector: mismatched[0].selector,
            section: sec,
            elementIds: [cards[0].id, mismatched[0].id],
          });
          break;
        }
      }
    }

    return issues;
  },
};
