import type { Rule, ScanContext, Issue } from '../../types/index.ts';
import { extractPageColors } from './colorExtractor.ts';
import { analyzeColorRoles, inferProductContext } from './colorRoleAnalyzer.ts';
import { calculateContrast } from './colorNormalizer.ts';

// C001 — Too Many Competing Accent Colors
export const C001_TooManyCompetingAccents: Rule = {
  id: 'C001',
  name: 'Too Many Competing Accent Colors',
  category: 'colors',
  description: 'Flags interfaces with three or more distinct saturated color families competing for visual attention.',
  defaultSeverity: 'high',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const productContext = inferProductContext(context);
    // Creative portfolios are permitted expressive palettes
    if (productContext.includes('Creative Portfolio')) return [];

    const { usages } = extractPageColors(context);

    // Filter to saturated accent usages on interactive or prominent elements
    const accentUsages = usages.filter(
      (u) => u.isSaturated && (u.isInteractive || u.source === 'background' || u.source === 'gradient')
    );

    const distinctHueFamilies = new Set(accentUsages.map((u) => u.hueGroup));

    // Exclude green/teal if used purely for success/pricing
    if (productContext.includes('Finance')) {
      distinctHueFamilies.delete('green');
      distinctHueFamilies.delete('red');
    }

    if (distinctHueFamilies.size >= 3) {
      const familyList = Array.from(distinctHueFamilies);
      const sampleSelectors = accentUsages.slice(0, 4).flatMap((u) => u.selectors);

      return [
        {
          id: 'issue-color-c001',
          ruleId: 'C001',
          category: 'colors',
          title: 'Too Many Competing Accent Colors',
          severity: 'high',
          confidence: 'high',
          evidence: `Interface uses ${distinctHueFamilies.size} conflicting saturated color families (${familyList.join(', ')}) across major interactive surfaces (${sampleSelectors.slice(0, 3).join(', ')}).`,
          recommendation: 'Establish one clear dominant primary accent for key actions. Restrict secondary colors to meaningful semantic status or deliberate categories.',
          diff: {
            remove: `accent palette: ${familyList.join(', ')};`,
            add: 'primary-accent: #6366F1; /* single dominant interaction color */',
          },
          selector: sampleSelectors[0],
          section: 'Color System',
          elementIds: accentUsages.slice(0, 3).flatMap((u) => u.elementIds),
        },
      ];
    }

    return [];
  },
};

// C002 — Accent Color Overuse
export const C002_AccentColorOveruse: Rule = {
  id: 'C002',
  name: 'Accent Color Overuse',
  category: 'colors',
  description: 'Flags interfaces where the primary accent is spread across headings, cards, icons, borders, and backgrounds.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const { usages } = extractPageColors(context);
    const { likelyBrandColors } = analyzeColorRoles(context, usages, new Map());

    if (likelyBrandColors.length === 0) return [];
    const brandHex = likelyBrandColors[0].normalizedHex;

    const brandUsages = usages.filter((u) => u.normalizedHex === brandHex);
    const sources = new Set(brandUsages.map((u) => u.source));
    const totalElementsWithAccent = brandUsages.reduce((acc, u) => acc + u.elementCount, 0);

    // Overused if applied across text, backgrounds, borders, AND shadows
    if (sources.size >= 3 && totalElementsWithAccent >= 10) {
      return [
        {
          id: 'issue-color-c002',
          ruleId: 'C002',
          category: 'colors',
          title: 'Accent Color Overuse',
          severity: 'medium',
          confidence: 'high',
          evidence: `Primary brand color ${brandHex} is used across ${sources.size} distinct CSS sources (${Array.from(sources).join(', ')}) on ${totalElementsWithAccent} elements, diluting visual hierarchy.`,
          recommendation: 'Use neutral surfaces for the majority of UI architecture. Reserve the primary accent as a scarce resource for key CTAs and active states.',
          diff: {
            remove: `${brandHex} applied to headings, cards, and borders;`,
            add: 'Reserve accent for primary CTAs and active indicators only;',
          },
          selector: brandUsages[0]?.selectors[0],
          section: 'Global Surfaces',
          elementIds: brandUsages[0]?.elementIds.slice(0, 3) || [],
        },
      ];
    }

    return [];
  },
};

// C003 — Weak Surface Hierarchy
export const C003_WeakSurfaceHierarchy: Rule = {
  id: 'C003',
  name: 'Weak Surface Hierarchy',
  category: 'colors',
  description: 'Detects when page canvas, cards, panels, and modals share an identical flat color without tonal elevation.',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const { usages } = extractPageColors(context);
    const bgUsages = usages.filter((u) => u.source === 'background' && u.isNeutral);

    // If there is only 1 neutral background color across all cards, modals, and containers
    if (bgUsages.length === 1 && context.elements.length >= 15) {
      const flatColor = bgUsages[0].normalizedHex;
      return [
        {
          id: 'issue-color-c003',
          ruleId: 'C003',
          category: 'colors',
          title: 'Weak Surface Hierarchy',
          severity: 'low',
          confidence: 'medium',
          evidence: `All page regions and card containers share the identical flat background (${flatColor}) with zero tonal surface layering.`,
          recommendation: 'Establish a subtle 3-tier neutral elevation: Canvas (base) -> Surface (cards) -> Raised Surface (modals/popovers) to create depth.',
          diff: {
            remove: `canvas and cards both use ${flatColor};`,
            add: 'canvas: #090B10; surface: #0F131F; surface-raised: #1A2237;',
          },
          section: 'Surface System',
          elementIds: bgUsages[0].elementIds.slice(0, 3),
        },
      ];
    }

    return [];
  },
};

// C004 — Low Contrast Text
export const C004_LowContrastText: Rule = {
  id: 'C004',
  name: 'Low Contrast Text',
  category: 'colors',
  description: 'Flags text elements with insufficient contrast against their background (WCAG AA < 4.5:1).',
  defaultSeverity: 'high',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const { elementBackgroundMap, elementColorMap } = extractPageColors(context);
    const lowContrastIssues: { el: any; ratio: number; fg: string; bg: string }[] = [];

    for (const el of context.elements) {
      if (!el.text || el.text.trim().length === 0) continue;
      const fg = elementColorMap.get(el.id);
      const bg = elementBackgroundMap.get(el.id);

      if (fg && bg) {
        const ratio = calculateContrast(fg.luminance, bg.luminance);
        const fontSize = parseFloat(el.computedStyle.fontSize) || 16;
        const isLarge = fontSize >= 24 || (fontSize >= 18 && parseInt(el.computedStyle.fontWeight, 10) >= 700);
        const minRatio = isLarge ? 3.0 : 4.5;

        if (ratio < minRatio && ratio > 1.05) {
          lowContrastIssues.push({
            el,
            ratio: Math.round(ratio * 10) / 10,
            fg: fg.hex,
            bg: bg.hex,
          });
        }
      }
    }

    if (lowContrastIssues.length > 0) {
      const sample = lowContrastIssues[0];
      return [
        {
          id: `issue-color-c004`,
          ruleId: 'C004',
          category: 'colors',
          title: 'Low Contrast Text',
          severity: 'high',
          confidence: 'high',
          evidence: `Text "${sample.el.directText.slice(0, 35)}" has low contrast ratio (${sample.ratio}:1) between text ${sample.fg} and background ${sample.bg}. (WCAG minimum is 4.5:1).`,
          recommendation: 'Increase tonal contrast between text and background surfaces to guarantee readability and accessibility compliance.',
          diff: {
            remove: `color: ${sample.fg}; (contrast ratio ${sample.ratio}:1);`,
            add: 'color: #F8FAFC; (contrast ratio >= 7.0:1);',
          },
          selector: sample.el.selector,
          section: sample.el.sectionName || 'Typography',
          elementIds: lowContrastIssues.slice(0, 3).map((i) => i.el.id),
        },
      ];
    }

    return [];
  },
};

// C005 — Random Color Usage
export const C005_RandomColorUsage: Rule = {
  id: 'C005',
  name: 'Random Decorative Color Variation',
  category: 'colors',
  description: 'Detects sibling feature cards or repeated cards that cycle through unrelated decorative colors without category meaning.',
  defaultSeverity: 'medium',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const productContext = inferProductContext(context);
    if (productContext.includes('Creative Portfolio')) return [];

    const issues: Issue[] = [];
    // Group sibling cards by parent container
    const cards = context.elements.filter(
      (e) => (e.selector.includes('card') || e.selector.includes('feature')) && e.rect.width > 120
    );

    if (cards.length >= 3) {
      const cardColors = new Set<string>();
      for (const c of cards) {
        const bg = c.computedStyle.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          cardColors.add(bg);
        }
      }

      // If cards have 3+ distinct background hues in the same group
      if (cardColors.size >= 3) {
        issues.push({
          id: 'issue-color-c005',
          ruleId: 'C005',
          category: 'colors',
          title: 'Random Decorative Card Colors',
          severity: 'medium',
          confidence: 'medium',
          evidence: `Sibling feature cards cycle through ${cardColors.size} different rainbow background colors without semantic category distinction.`,
          recommendation: 'Use color to communicate meaning, state, or interaction—not merely to artificially decorate otherwise identical feature cards.',
          diff: {
            remove: 'card 1: blue; card 2: purple; card 3: orange;',
            add: 'standardize card background: #0F131F; border: 1px solid #1E2538;',
          },
          selector: cards[0]?.selector,
          section: cards[0]?.sectionName || 'Features',
          elementIds: cards.map((c) => c.id),
        });
      }
    }

    return issues;
  },
};

// C006 — Excessive Decorative Color Noise
export const C006_ExcessiveDecorativeColor: Rule = {
  id: 'C006',
  name: 'Excessive Decorative Color',
  category: 'colors',
  description: 'Flags saturated colors used predominantly for ambient background blobs, halos, or glowing orbs.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const { usages } = extractPageColors(context);
    const { distribution } = analyzeColorRoles(context, usages, new Map());

    if (distribution.decorativePercentage > 15) {
      return [
        {
          id: 'issue-color-c006',
          ruleId: 'C006',
          category: 'colors',
          title: 'Excessive Decorative Color Noise',
          severity: 'medium',
          confidence: 'high',
          evidence: `Decorative color represents ${distribution.decorativePercentage}% of all colored visual surfaces (blobs, saturated shadows, ambient haze).`,
          recommendation: 'Tone down decorative ambient color. Build visual hierarchy through clear typography scale, deliberate layout grouping, and quiet surface contrast.',
          diff: {
            remove: 'ambient colored blurred orbs and saturated halos;',
            add: 'subtle neutral background with clean interaction focus;',
          },
          section: 'Surfaces',
          elementIds: [],
        },
      ];
    }

    return [];
  },
};

// C007 — Gradient Overuse
export const C007_GradientOveruse: Rule = {
  id: 'C007',
  name: 'Gradient Overuse',
  category: 'colors',
  description: 'Detects multiple distinct decorative gradients competing across backgrounds, text, and cards.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const gradientElements = context.elements.filter(
      (e) => e.computedStyle.backgroundImage && e.computedStyle.backgroundImage.includes('gradient')
    );

    if (gradientElements.length >= 3) {
      return [
        {
          id: 'issue-color-c007',
          ruleId: 'C007',
          category: 'colors',
          title: 'Multiple Competing Gradients',
          severity: 'medium',
          confidence: 'high',
          evidence: `${gradientElements.length} separate interface elements utilize decorative multi-color gradients (${gradientElements.slice(0, 2).map((e) => e.selector).join(', ')}).`,
          recommendation: 'Limit gradients to a single intentional brand touchpoint (if brand-appropriate). Replace decorative surface gradients with solid tonal backgrounds.',
          diff: {
            remove: 'linear-gradient(...) across cards and buttons;',
            add: 'solid neutral surface with crisp 1px border stroke;',
          },
          selector: gradientElements[0]?.selector,
          section: 'Surfaces',
          elementIds: gradientElements.map((e) => e.id),
        },
      ];
    }

    return [];
  },
};

// C008 — Inconsistent Interactive States
export const C008_InconsistentInteractiveStates: Rule = {
  id: 'C008',
  name: 'Inconsistent Interactive Action Colors',
  category: 'colors',
  description: 'Flags interfaces with conflicting color treatments on primary interactive buttons.',
  defaultSeverity: 'medium',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const buttons = context.elements.filter(
      (e) => (e.tagName === 'BUTTON' || e.role === 'button') && e.rect.width > 70 && e.rect.height > 25
    );

    if (buttons.length >= 3) {
      const buttonBgHues = new Set<string>();
      for (const btn of buttons) {
        const bg = btn.computedStyle.backgroundColor;
        if (bg && bg !== 'transparent') {
          buttonBgHues.add(bg);
        }
      }

      if (buttonBgHues.size >= 3) {
        return [
          {
            id: 'issue-color-c008',
            ruleId: 'C008',
            category: 'colors',
            title: 'Conflicting Action Button Colors',
            severity: 'medium',
            confidence: 'medium',
            evidence: `Action buttons use ${buttonBgHues.size} conflicting background color treatments across the same page.`,
            recommendation: 'Standardize on one primary button style using the primary brand accent, with subtle secondary ghost or outline buttons.',
            diff: {
              remove: 'mismatched button background colors;',
              add: 'primary CTA: var(--color-primary); secondary CTA: transparent border-slate-700;',
            },
            selector: buttons[0]?.selector,
            section: 'Actions',
            elementIds: buttons.map((b) => b.id),
          },
        ];
      }
    }

    return [];
  },
};

// C009 — Semantic Color Misuse
export const C009_SemanticColorMisuse: Rule = {
  id: 'C009',
  name: 'Semantic Color Misuse',
  category: 'colors',
  description: 'Flags destructive red or status alert colors used for routine, non-destructive primary actions.',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      if (el.isInteractive && el.tagName === 'BUTTON') {
        const text = el.directText.toLowerCase();
        const bg = el.computedStyle.backgroundColor.toLowerCase();

        // If red background is used on non-destructive buttons like "Get Started" or "Explore"
        const isRed = bg.includes('rgb(239, 68, 68)') || bg.includes('rgb(220, 38, 38)') || bg.includes('#ef4444') || bg.includes('#dc2626') || bg.includes('red');
        const isRoutineAction = /get started|sign up|start free|explore|learn more|continue/i.test(text);

        if (isRed && isRoutineAction) {
          issues.push({
            id: `issue-${el.id}-c009`,
            ruleId: 'C009',
            category: 'colors',
            title: 'Destructive Red on Primary Action',
            severity: 'low',
            confidence: 'medium',
            evidence: `Routine action button "${el.directText}" is styled in high-alert red (${bg}), which typically communicates destructive deletion or fatal error.`,
            recommendation: 'Reserve red for destructive deletion or critical warning states. Use your primary brand accent for routine call-to-actions.',
            diff: {
              remove: `background-color: ${bg};`,
              add: 'background-color: var(--color-primary);',
            },
            selector: el.selector,
            section: el.sectionName || 'Actions',
            elementIds: [el.id],
          });
          break;
        }
      }
    }
    return issues;
  },
};

// C010 — Excessive Saturation
export const C010_ExcessiveSaturation: Rule = {
  id: 'C010',
  name: 'Excessive Visual Saturation',
  category: 'colors',
  description: 'Flags interfaces where high-chroma saturated surfaces overpower the neutral foundation.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const productContext = inferProductContext(context);
    if (productContext.includes('Creative Portfolio')) return [];

    const { usages } = extractPageColors(context);
    const { distribution } = analyzeColorRoles(context, usages, new Map());

    if (distribution.accentPercentage + distribution.decorativePercentage > 40) {
      return [
        {
          id: 'issue-color-c010',
          ruleId: 'C010',
          category: 'colors',
          title: 'Excessive Visual Saturation',
          severity: 'medium',
          confidence: 'high',
          evidence: `High-chroma saturated colors account for ${distribution.accentPercentage + distribution.decorativePercentage}% of all colored visual surfaces.`,
          recommendation: 'Anchor the product on a calm neutral foundation (65-80% neutral). Reserve saturated chroma for deliberate interaction emphasis.',
          diff: {
            remove: 'heavy saturated surfaces across structural containers;',
            add: 'quiet neutral foundation with focused accent usage;',
          },
          section: 'Global Surfaces',
          elementIds: [],
        },
      ];
    }

    return [];
  },
};

// C011 — Too Many Distinct Text Colors
export const C011_TooManyTextColors: Rule = {
  id: 'C011',
  name: 'Too Many Distinct Text Colors',
  category: 'colors',
  description: 'Flags interfaces with 6 or more distinct text colors, indicating lack of a shared typographic color token system.',
  defaultSeverity: 'low',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const { usages } = extractPageColors(context);
    const textUsages = usages.filter((u) => u.source === 'text');

    // Aim 4-5 or fewer semantic tokens; flag if 6 or more
    if (textUsages.length >= 6) {
      const distinctHexes = Array.from(new Set(textUsages.map((u) => u.normalizedHex)));
      const sampleSelectors = textUsages.slice(0, 4).flatMap((u) => u.selectors);

      return [
        {
          id: 'issue-color-c011',
          ruleId: 'C011',
          category: 'colors',
          title: 'Too Many Distinct Text Colors',
          severity: textUsages.length >= 12 ? 'medium' : 'low',
          confidence: 'high',
          evidence: `Found ${textUsages.length} distinct text colors (aim 4 or fewer semantic tokens). Detected colors: ${distinctHexes.slice(0, 6).join(', ')}${distinctHexes.length > 6 ? '...' : ''}.`,
          recommendation: 'Reduce text colors to a small semantic token set — primary (high contrast), secondary (subheadings), muted (metadata/captions), and accent/link.',
          diff: {
            remove: `${textUsages.length} scattered text colors (${distinctHexes.slice(0, 3).join(', ')}...);`,
            add: 'tokens: --text-primary: #F8FAFC; --text-secondary: #94A3B8; --text-muted: #64748B;',
          },
          selector: sampleSelectors[0],
          section: 'Global Typography',
          elementIds: textUsages.slice(0, 3).flatMap((u) => u.elementIds),
        },
      ];
    }

    return [];
  },
};

export const COLOR_RULES: Rule[] = [
  C001_TooManyCompetingAccents,
  C002_AccentColorOveruse,
  C003_WeakSurfaceHierarchy,
  C004_LowContrastText,
  C005_RandomColorUsage,
  C006_ExcessiveDecorativeColor,
  C007_GradientOveruse,
  C008_InconsistentInteractiveStates,
  C009_SemanticColorMisuse,
  C010_ExcessiveSaturation,
  C011_TooManyTextColors,
];
