import type { Rule, ScanContext, Issue, ElementSnapshot } from '../../types/index.ts';

export const R070_InfiniteDecorativeAnimation: Rule = {
  id: 'R070',
  name: 'Infinite Decorative Animation',
  category: 'motion',
  description: 'Detects non-interactive interface elements running infinite CSS keyframe loops.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const animatedElements: ElementSnapshot[] = [];
    for (const el of context.elements) {
      if (
        el.computedStyle.animationIterationCount === 'infinite' &&
        el.computedStyle.animationName &&
        el.computedStyle.animationName !== 'none'
      ) {
        // Exclude loading spinners, progress bars, or marquees
        if (/spin|load|progress/i.test(el.computedStyle.animationName)) continue;
        if (el.selector && /(loading|progress|spinner)/i.test(el.selector)) continue;

        if (!el.isInteractive) {
          animatedElements.push(el);
        }
      }
    }

    if (animatedElements.length > 0) {
      const sample = animatedElements[0];
      return [
        {
          id: 'issue-motion-r070',
          ruleId: 'R070',
          category: 'motion',
          title: 'Infinite Decorative Animation',
          severity: 'medium',
          confidence: 'high',
          evidence: animatedElements.length === 1
            ? `Element executes continuous infinite animation "${sample.computedStyle.animationName}" without user interaction.`
            : `${animatedElements.length} elements execute continuous infinite keyframe animations without user interaction.`,
          recommendation: 'Eliminate continuous ambient motion. Reserve motion for purposeful state transitions and user feedback.',
          selector: sample.selector,
          section: sample.sectionName || 'Motion',
          elementIds: animatedElements.map((e) => e.id),
        },
      ];
    }
    return [];
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
    const layoutAnimated: ElementSnapshot[] = [];
    const layoutPropRegex = /\b(width|height|top|left|right|bottom|margin|padding)\b/i;

    for (const el of context.elements) {
      const transProp = el.computedStyle.transitionProperty || '';
      if (layoutPropRegex.test(transProp) && transProp !== 'all') {
        const dur = parseFloat(el.computedStyle.transitionDuration);
        if (dur > 0) {
          layoutAnimated.push(el);
        }
      }
    }

    if (layoutAnimated.length > 0) {
      const sample = layoutAnimated[0];
      return [
        {
          id: 'issue-motion-r071',
          ruleId: 'R071',
          category: 'motion',
          title: 'Layout Property Transition',
          severity: 'medium',
          confidence: 'high',
          evidence: layoutAnimated.length === 1
            ? `Element transitions layout property "${sample.computedStyle.transitionProperty}" which triggers browser layout recalculations.`
            : `${layoutAnimated.length} elements transition layout properties, triggering browser layout recalculations.`,
          recommendation: 'Transition performant GPU composited properties (transform: scale/translate and opacity) instead of dimensional properties.',
          selector: sample.selector,
          section: sample.sectionName || 'Components',
          elementIds: layoutAnimated.map((e) => e.id),
        },
      ];
    }
    return [];
  },
};
