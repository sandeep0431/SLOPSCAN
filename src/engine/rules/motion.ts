import type { Rule, ScanContext, Issue } from '../../types/index.ts';

export const R070_InfiniteDecorativeAnimation: Rule = {
  id: 'R070',
  name: 'Infinite Decorative Animation',
  category: 'motion',
  description: 'Detects non-interactive interface elements running infinite CSS keyframe loops.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      if (
        el.computedStyle.animationIterationCount === 'infinite' &&
        el.computedStyle.animationName &&
        el.computedStyle.animationName !== 'none'
      ) {
        // Exclude loading spinners, carousels or marquee text if intentional
        if (/spin|load|progress/i.test(el.computedStyle.animationName)) continue;

        if (!el.isInteractive) {
          issues.push({
            id: `issue-${el.id}-r070`,
            ruleId: 'R070',
            category: 'motion',
            title: 'Infinite Decorative Animation',
            severity: 'medium',
            confidence: 'high',
            evidence: `Element executes continuous infinite animation "${el.computedStyle.animationName}" without user interaction.`,
            recommendation: 'Eliminate continuous ambient motion. Reserve motion for purposeful state transitions and user feedback.',
            selector: el.selector,
            section: el.sectionName || 'Motion',
            elementIds: [el.id],
          });
          if (issues.length >= 2) break;
        }
      }
    }
    return issues;
  },
};


// R071: Layout Animation
export const R071_LayoutAnimation: Rule = {
  id: 'R071',
  name: 'Layout Property Animation',
  category: 'motion',
  description: 'Flags CSS transitions or animations targeting geometry-altering layout properties (width, height, top, left, margin).',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    const layoutPropRegex = /\b(width|height|top|left|right|bottom|margin|padding)\b/i;

    for (const el of context.elements) {
      const transProp = el.computedStyle.transitionProperty || '';
      if (layoutPropRegex.test(transProp) && transProp !== 'all') {
        const dur = parseFloat(el.computedStyle.transitionDuration);
        if (dur > 0) {
          issues.push({
            id: `issue-${el.id}-r071`,
            ruleId: 'R071',
            category: 'motion',
            title: 'Layout Property Transition',
            severity: 'medium',
            confidence: 'high',
            evidence: `Element transitions layout property "${transProp}" which triggers browser layout recalculations.`,
            recommendation: 'Transition performant GPU composited properties (transform: scale/translate and opacity) instead of dimensional properties.',
            selector: el.selector,
            section: el.sectionName || 'Components',
            elementIds: [el.id],
          });
          if (issues.length >= 2) break;
        }
      }
    }
    return issues;
  },
};
