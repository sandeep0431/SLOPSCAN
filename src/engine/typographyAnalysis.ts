import type { ScanContext, TypographyAnalysis } from '../types/index.ts';

export function analyzeTypography(context: ScanContext): TypographyAnalysis {
  const familyCount = new Map<string, number>();
  const sizeCount = new Map<string, number>();
  const weightCount = new Map<string, number>();

  let primaryHeadingFamily = '';
  let bodyFamily = '';

  for (const el of context.elements) {
    if (!el.text || el.text.trim().length === 0) continue;

    // Font Family
    const rawFam = el.computedStyle.fontFamily || '';
    const cleanFam = rawFam.split(',')[0].replace(/['"]/g, '').trim();
    if (cleanFam && !/icon|symbol|fa-|material/i.test(cleanFam)) {
      familyCount.set(cleanFam, (familyCount.get(cleanFam) || 0) + 1);

      if (/^h[1-2]$/i.test(el.tagName) && !primaryHeadingFamily) {
        primaryHeadingFamily = cleanFam;
      }
      if (el.tagName === 'P' && !bodyFamily) {
        bodyFamily = cleanFam;
      }
    }

    // Font Size
    const size = el.computedStyle.fontSize;
    if (size) {
      sizeCount.set(size, (sizeCount.get(size) || 0) + 1);
    }

    // Font Weight
    const weight = el.computedStyle.fontWeight;
    if (weight) {
      weightCount.set(weight, (weightCount.get(weight) || 0) + 1);
    }
  }

  const distinctFamilies = Array.from(familyCount.keys());

  const distinctSizes = Array.from(sizeCount.entries())
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => parseFloat(b.size) - parseFloat(a.size));

  const distinctWeights = Array.from(weightCount.entries())
    .map(([weight, count]) => ({ weight, count }))
    .sort((a, b) => parseInt(b.weight, 10) - parseInt(a.weight, 10));

  // Determine site vibe from title and text content
  const fullText = (context.page.title + ' ' + (context.page.metaDescription || '')).toLowerCase();
  const isDev = /developer|code|api|sdk|cloud|cli|git|database|security/i.test(fullText);
  const isEditorial = /journal|magazine|essay|blog|publishing|story|news/i.test(fullText);

  let suggested;
  if (isDev) {
    suggested = {
      category: 'Developer & Technical Tooling',
      headingFont: 'Space Grotesk or IBM Plex Sans',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      reason: 'Crisp geometric forms with dedicated mono data display communicate engineering precision.',
    };
  } else if (isEditorial) {
    suggested = {
      category: 'Editorial & Long-Form Publishing',
      headingFont: 'Playfair Display',
      bodyFont: 'Source Serif 4',
      reason: 'Elegant high-contrast serifs provide literary warmth and reading comfort.',
    };
  } else {
    suggested = {
      category: 'Modern Product & SaaS',
      headingFont: 'Manrope or Plus Jakarta Sans',
      bodyFont: 'Inter',
      monoFont: 'IBM Plex Mono',
      reason: 'Neutral, highly legible modern grotesque sans-serif with excellent micro-contrast.',
    };
  }

  const alternative = {
    headingFont: 'DM Sans',
    bodyFont: 'System UI (-apple-system, BlinkMacSystemFont)',
    reason: 'Zero-weight dependency utilizing system fonts for instant rendering and native fidelity.',
  };

  const currentMain = primaryHeadingFamily || distinctFamilies[0] || 'System Font';

  return {
    distinctFamilies,
    distinctSizes,
    distinctWeights,
    primaryHeadingFamily,
    bodyFamily,
    recommendations: {
      preserve: `Retain ${currentMain} as the primary brand identifier. Avoid introducing third-party display fonts.`,
      simplify: `Consolidate your ${distinctSizes.length} active font sizes into a strict 6-step scale (12px, 14px, 16px, 20px, 28px, 40px) and cap weights at 400 (regular) and 600 (semi-bold).`,
      suggested,
      alternative,
    },
  };
}
