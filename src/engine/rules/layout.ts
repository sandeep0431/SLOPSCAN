import type { Rule, ScanContext, Issue } from '../../types/index.ts';

export const R060_TooManyHeroActions: Rule = {
  id: 'R060',
  name: 'Too Many Hero Actions',
  category: 'layout',
  description: 'Flags hero sections presenting three or more competing primary call-to-action buttons.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    // Find Hero section
    const heroSection = context.sections.find((s) => /hero|header|intro/i.test(s.name));
    const heroElements = heroSection
      ? context.elements.filter((e) => e.sectionId === heroSection.id)
      : context.elements.filter((e) => e.rect.y < 700);

    const interactiveButtons = heroElements.filter(
      (e) =>
        (e.tagName === 'BUTTON' || e.role === 'button' || (e.tagName === 'A' && e.rect.height > 30)) &&
        e.rect.width > 80 &&
        e.rect.height > 30
    );

    if (interactiveButtons.length >= 3) {
      return [
        {
          id: 'issue-layout-r060',
          ruleId: 'R060',
          category: 'layout',
          title: 'Competing Hero Actions',
          severity: 'medium',
          confidence: 'high',
          evidence: `Hero area contains ${interactiveButtons.length} prominent action buttons, diluting decision hierarchy.`,
          recommendation: 'Streamline to one clear primary call-to-action and one subtle secondary action (text link or ghost button).',
          selector: interactiveButtons[0]?.selector,
          section: 'Hero',
          elementIds: interactiveButtons.map((b) => b.id),
        },
      ];
    }
    return [];
  },
};
