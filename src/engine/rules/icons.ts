import type { Rule, ScanContext, Issue } from '../../types/index.ts';

// Comprehensive regex for emoji characters
const EMOJI_REGEX = /([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}])/u;

// Functional punctuation / UI close symbols that should not be flagged as decorative emoji
const FUNCTIONAL_SYMBOLS = new Set([
  '✕', '×', '✖', '+', '−', '-', '…', '•', '✓', '✔', '→', '←', '↑', '↓', '▲', '▼', '◀', '▶',
]);

export const R030_DecorativeEmoji: Rule = {
  id: 'R030',
  name: 'Decorative Emoji',
  category: 'icons',
  description: 'Detects emoji used as icons inside buttons, navigation links, tags, and headings.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      // Look at buttons, navigation, headers, cards
      const isCandidate =
        el.isInteractive ||
        /^h[1-6]$/i.test(el.tagName) ||
        el.role === 'button' ||
        el.role === 'menuitem' ||
        (el.rect.width < 250 && el.rect.height < 60);

      if (!isCandidate) continue;

      const text = el.directText || el.text;
      const match = text.match(EMOJI_REGEX);
      if (match) {
        if (FUNCTIONAL_SYMBOLS.has(match[0])) continue;
        issues.push({
          id: `issue-${el.id}-r030`,
          ruleId: 'R030',
          category: 'icons',
          title: 'Decorative Emoji in UI Component',
          severity: 'medium',
          confidence: 'high',
          evidence: `Component "${text.slice(0, 35)}" embeds decorative emoji character "${match[0]}".`,
          recommendation: 'Replace decorative emoji with a unified SVG icon set (e.g. Lucide, Feather, Heroicons) or rely on clear typography.',
          selector: el.selector,
          section: el.sectionName || 'Navigation / Action',
          elementIds: [el.id],
        });
        if (issues.length >= 4) break;
      }
    }
    return issues;
  },
};

export const R032_DecorativeSparkles: Rule = {
  id: 'R032',
  name: 'Decorative Sparkles',
  category: 'icons',
  description: 'Detects sparkle emojis (✨) or decorative star icons used as AI/hype ornaments.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const text = el.directText || el.text;
      if (text.includes('✨') || text.includes('🪄')) {
        issues.push({
          id: `issue-${el.id}-r032`,
          ruleId: 'R032',
          category: 'icons',
          title: 'Decorative Sparkle Embellishment',
          severity: 'medium',
          confidence: 'high',
          evidence: `Element "${text.slice(0, 40)}" incorporates sparkle ornament (✨/🪄) commonly associated with generic AI tropes.`,
          recommendation: 'Eliminate decorative sparkles. Communicate capability and value proposition directly through clear, descriptive copy.',
          selector: el.selector,
          section: el.sectionName || 'Header / Feature',
          elementIds: [el.id],
        });
        if (issues.length >= 2) break;
      }
    }
    return issues;
  },
};
