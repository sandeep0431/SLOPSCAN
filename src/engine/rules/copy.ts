import type { Rule, ScanContext, Issue } from '../../types/index.ts';

const HYPE_KEYWORDS = [
  'revolutionary',
  'game-changing',
  'supercharge',
  'seamless',
  'transform',
  'magic',
  'effortlessly',
  'next-level',
  'cutting-edge',
  'world-class',
  'hyper-growth',
  '10x',
];

const AI_PHRASES = [
  'powered by ai',
  'ai-powered',
  'unlock the power of ai',
  'transform with ai',
  'ai driven',
  'ai-first',
  'supercharged by ai',
  'ai copilot for everything',
];

const PLACEHOLDER_KEYWORDS = [
  'lorem ipsum',
  '[company name]',
  '[your name]',
  'todo:',
  'coming soon',
  'sample text',
  'insert title here',
];

export const R040_ExcessiveExclamation: Rule = {
  id: 'R040',
  name: 'Excessive Exclamation',
  category: 'copy',
  description: 'Detects exclamation marks or multi-exclamation punctuation in headings.',
  defaultSeverity: 'low',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      if (/^h[1-4]$/i.test(el.tagName) || el.computedStyle.fontWeight === '700' || el.computedStyle.fontWeight === '800') {
        const text = el.directText.trim();
        if (text.includes('!!') || (text.endsWith('!') && text.length < 50)) {
          issues.push({
            id: `issue-${el.id}-r040`,
            ruleId: 'R040',
            category: 'copy',
            title: 'Exclamation in Heading Copy',
            severity: 'low',
            confidence: 'high',
            evidence: `Headline "${text}" relies on exclamation punctuation for emphasis.`,
            recommendation: 'Remove exclamation marks. Deliver confidence and clarity through definitive statements rather than artificial excitement.',
            selector: el.selector,
            section: el.sectionName || 'Headlines',
            elementIds: [el.id],
          });
          if (issues.length >= 2) break;
        }
      }
    }
    return issues;
  },
};

export const R041_GenericHypeLanguage: Rule = {
  id: 'R041',
  name: 'Generic Hype Language',
  category: 'copy',
  description: 'Flags clichéd marketing buzzwords in prominent hero or section headlines.',
  defaultSeverity: 'low',
  defaultConfidence: 'medium',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      if (/^h[1-4]$/i.test(el.tagName) || el.rect.height > 24) {
        const lower = el.directText.toLowerCase();
        for (const word of HYPE_KEYWORDS) {
          const regex = new RegExp(`\\b${word}\\b`, 'i');
          if (regex.test(lower)) {
            issues.push({
              id: `issue-${el.id}-r041`,
              ruleId: 'R041',
              category: 'copy',
              title: 'Generic Hype Buzzword',
              severity: 'low',
              confidence: 'medium',
              evidence: `Prominent headline contains generic buzzword "${word}": "${el.directText.trim().slice(0, 50)}..."`,
              recommendation: `Replace hyperbolic buzzword ("${word}") with specific facts, concrete metrics, or tangible workflow outcomes.`,
              selector: el.selector,
              section: el.sectionName || 'Marketing Copy',
              elementIds: [el.id],
            });
            break;
          }
        }
      }
      if (issues.length >= 3) break;
    }
    return issues;
  },
};

export const R044_GenericAICopy: Rule = {
  id: 'R044',
  name: 'Generic AI Copy',
  category: 'copy',
  description: 'Flags vague "AI-powered" slogans that fail to explain underlying capability.',
  defaultSeverity: 'medium',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const lower = el.directText.toLowerCase();
      for (const phrase of AI_PHRASES) {
        if (lower.includes(phrase)) {
          issues.push({
            id: `issue-${el.id}-r044`,
            ruleId: 'R044',
            category: 'copy',
            title: 'Vague AI-Centric Slogan',
            severity: 'medium',
            confidence: 'high',
            evidence: `Text states "${phrase}": "${el.directText.trim().slice(0, 60)}"`,
            recommendation: 'Specify the exact automated action (e.g. "Auto-generates pull request summaries" instead of "Supercharged by AI").',
            selector: el.selector,
            section: el.sectionName || 'Copy',
            elementIds: [el.id],
          });
          break;
        }
      }
      if (issues.length >= 2) break;
    }
    return issues;
  },
};

export const R043_PlaceholderContent: Rule = {
  id: 'R043',
  name: 'Placeholder Content',
  category: 'copy',
  description: 'Detects unresolved lorem ipsum or boilerplate template placeholders in live DOM.',
  defaultSeverity: 'high',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of context.elements) {
      const lower = (el.directText || el.text).toLowerCase();
      for (const ph of PLACEHOLDER_KEYWORDS) {
        if (lower.includes(ph)) {
          issues.push({
            id: `issue-${el.id}-r043`,
            ruleId: 'R043',
            category: 'copy',
            title: 'Unresolved Placeholder Text',
            severity: 'high',
            confidence: 'high',
            evidence: `Detected placeholder string "${ph}" in: "${el.text.slice(0, 40)}"`,
            recommendation: 'Replace placeholder mockup text with genuine production copy before deploying.',
            selector: el.selector,
            section: el.sectionName || 'Content',
            elementIds: [el.id],
          });
          break;
        }
      }
      if (issues.length >= 2) break;
    }
    return issues;
  },
};


// R042: Generic Greeting Headline
export const R042_GenericGreetingHeadline: Rule = {
  id: 'R042',
  name: 'Generic Greeting Headline',
  category: 'copy',
  description: 'Flags generic placeholder greetings (e.g. "Welcome to...", "Hey there!") used as primary titles.',
  defaultSeverity: 'low',
  defaultConfidence: 'high',
  run(context: ScanContext): Issue[] {
    const issues: Issue[] = [];
    const greetingRegex = /^(welcome\s+to\b|welcome\s+back\b|hey\s+there\b|hello\s+world\b|hello!\b)/i;

    for (const el of context.elements) {
      if (/^h[1-2]$/i.test(el.tagName) || el.rect.y < 500) {
        const text = el.directText.trim();
        if (greetingRegex.test(text) && text.length < 40) {
          issues.push({
            id: `issue-${el.id}-r042`,
            ruleId: 'R042',
            category: 'copy',
            title: 'Generic Greeting Headline',
            severity: 'low',
            confidence: 'high',
            evidence: `Prominent headline uses generic greeting: "${text}"`,
            recommendation: 'Replace generic greeting with the actual product value proposition or primary workflow action.',
            selector: el.selector,
            section: el.sectionName || 'Hero / Header',
            elementIds: [el.id],
          });
          break;
        }
      }
    }
    return issues;
  },
};
