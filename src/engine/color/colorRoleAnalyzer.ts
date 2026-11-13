import type {
  ScanContext,
  ColorUsage,
  ColorRole,
  BrandColorCandidate,
  ColorDistribution,
  Confidence,
} from '../../types/index.ts';
import type { ParsedColor } from './colorNormalizer.ts';

export function inferProductContext(context: ScanContext): string {
  const fullText = (
    context.page.title +
    ' ' +
    (context.page.metaDescription || '') +
    ' ' +
    context.elements
      .slice(0, 15)
      .map((e) => e.directText)
      .join(' ')
  ).toLowerCase();

  if (/health|clinical|medical|patient|hospital|doctor|risk|diagnosis/i.test(fullText)) {
    return 'Healthcare & Clinical Decision Intelligence';
  }
  if (/financial|finance|trading|crypto|banking|invest|stocks|wealth|payment|ledger/i.test(fullText)) {
    return 'Finance & FinTech Platform';
  }
  if (/portfolio|designer|photography|creative|artist|studio|gallery|art direction/i.test(fullText)) {
    return 'Creative Portfolio & Design Studio';
  }
  if (/developer|api|sdk|cloud|git|database|devops|cli|code|terminal/i.test(fullText)) {
    return 'Developer & Engineering Tooling';
  }
  if (/store|shop|cart|checkout|pricing|ecommerce|products|buy/i.test(fullText)) {
    return 'E-Commerce & Digital Commerce';
  }
  if (/analytics|dashboard|metrics|telemetry|reporting|insights|bi/i.test(fullText)) {
    return 'Analytics & Data Platform';
  }
  if (/journal|editorial|news|article|essay|publishing|magazine/i.test(fullText)) {
    return 'Editorial & Long-Form Publishing';
  }

  return 'Modern Product & Cloud SaaS';
}

export function analyzeColorRoles(
  context: ScanContext,
  usages: ColorUsage[],
  colorMap: Map<string, ParsedColor>
): {
  roles: ColorRole[];
  likelyBrandColors: BrandColorCandidate[];
  distribution: ColorDistribution;
  dominantColors: string[];
} {
  const roles: ColorRole[] = [];
  const brandScores = new Map<string, { score: number; evidence: string[]; rawColor: string }>();

  // Helper to add brand score
  const addBrandScore = (hex: string, raw: string, points: number, reason: string) => {
    if (!brandScores.has(hex)) {
      brandScores.set(hex, { score: 0, evidence: [], rawColor: raw });
    }
    const item = brandScores.get(hex)!;
    item.score += points;
    if (!item.evidence.includes(reason)) {
      item.evidence.push(reason);
    }
  };

  // 1. Identify canvas background
  const bodyEl = context.elements.find((e) => e.tagName === 'BODY' || e.selector === 'body');
  const canvasHex = bodyEl
    ? colorMap.get(usages.find((u) => u.source === 'background' && u.elementIds.includes(bodyEl.id))?.normalizedHex || '')?.hex
    : usages.find((u) => u.source === 'background' && u.isNeutral)?.normalizedHex || '#FFFFFF';

  if (canvasHex) {
    roles.push({
      role: 'canvas',
      color: canvasHex,
      normalizedHex: canvasHex,
      confidence: 'high',
      evidence: ['Identified as root document canvas background.'],
    });
  }

  // 2. Identify surface and raised surfaces
  const containerBgUsages = usages.filter(
    (u) => u.source === 'background' && u.isNeutral && u.normalizedHex !== canvasHex
  );

  if (containerBgUsages.length > 0) {
    roles.push({
      role: 'surface',
      color: containerBgUsages[0].normalizedHex,
      normalizedHex: containerBgUsages[0].normalizedHex,
      confidence: 'high',
      evidence: [`Used on ${containerBgUsages[0].elementCount} structural containers.`],
    });
    if (containerBgUsages.length > 1) {
      roles.push({
        role: 'surface-raised',
        color: containerBgUsages[1].normalizedHex,
        normalizedHex: containerBgUsages[1].normalizedHex,
        confidence: 'medium',
        evidence: [`Used on elevated cards and overlay layers.`],
      });
    }
  }

  // 3. Identify text hierarchy
  const textUsages = usages.filter((u) => u.source === 'text');
  if (textUsages.length > 0) {
    roles.push({
      role: 'text-primary',
      color: textUsages[0].normalizedHex,
      normalizedHex: textUsages[0].normalizedHex,
      confidence: 'high',
      evidence: [`Dominant text color across ${textUsages[0].elementCount} text elements.`],
    });
    if (textUsages.length > 1) {
      roles.push({
        role: 'text-secondary',
        color: textUsages[1].normalizedHex,
        normalizedHex: textUsages[1].normalizedHex,
        confidence: 'medium',
        evidence: [`Secondary reading color.`],
      });
    }
    if (textUsages.length > 2) {
      roles.push({
        role: 'text-muted',
        color: textUsages[2].normalizedHex,
        normalizedHex: textUsages[2].normalizedHex,
        confidence: 'review',
        evidence: [`Muted caption/label text color.`],
      });
    }
  }

  // 4. Identify brand and accent colors
  for (const el of context.elements) {
    const isPrimaryCTA =
      el.isInteractive &&
      (el.selector.includes('primary') ||
        el.selector.includes('cta') ||
        el.selector.includes('btn-main') ||
        el.rect.y < 800 && el.rect.width > 90);

    const isLogo =
      el.selector.includes('logo') ||
      el.selector.includes('brand') ||
      el.role === 'banner';

    const isNav =
      el.sectionName === 'Navigation' || el.selector.includes('nav');

    // Check background
    const bgUsage = usages.find(
      (u) => u.source === 'background' && u.elementIds.includes(el.id) && u.isSaturated
    );
    if (bgUsage) {
      if (isPrimaryCTA) {
        addBrandScore(bgUsage.normalizedHex, bgUsage.color, 4, 'Used as background on prominent primary CTA action.');
      }
      if (isLogo) {
        addBrandScore(bgUsage.normalizedHex, bgUsage.color, 4, 'Used in logo/brand presentation container.');
      }
      if (isNav) {
        addBrandScore(bgUsage.normalizedHex, bgUsage.color, 2, 'Used in navigation interaction states.');
      }
      if (el.isInteractive) {
        addBrandScore(bgUsage.normalizedHex, bgUsage.color, 2, 'Active on interactive interface controls.');
      }
    }

    // Check text
    const textUsage = usages.find(
      (u) => u.source === 'text' && u.elementIds.includes(el.id) && u.isSaturated
    );
    if (textUsage && (isLogo || isPrimaryCTA)) {
      addBrandScore(textUsage.normalizedHex, textUsage.color, 3, 'Used as high-contrast brand typography color.');
    }
  }

  // Rank brand candidates
  const brandList = Array.from(brandScores.entries())
    .map(([hex, data]) => ({
      color: data.rawColor,
      normalizedHex: hex,
      score: data.score,
      evidence: data.evidence,
    }))
    .sort((a, b) => b.score - a.score);

  const likelyBrandColors: BrandColorCandidate[] = brandList.slice(0, 2).map((b, idx) => ({
    color: b.color,
    normalizedHex: b.normalizedHex,
    confidence: (b.score >= 5 ? 'high' : 'medium') as Confidence,
    role: idx === 0 ? 'Primary Brand Identity' : 'Secondary Brand Accent',
    evidence: b.evidence,
  }));

  if (likelyBrandColors.length > 0) {
    roles.push({
      role: 'primary-accent',
      color: likelyBrandColors[0].color,
      normalizedHex: likelyBrandColors[0].normalizedHex,
      confidence: likelyBrandColors[0].confidence,
      evidence: likelyBrandColors[0].evidence,
    });
  }

  // 5. Measure distribution
  let neutralCount = 0;
  let accentCount = 0;
  let semanticCount = 0;
  let decorativeCount = 0;

  for (const u of usages) {
    if (u.isNeutral) {
      neutralCount += u.frequency;
    } else {
      // Check if green/amber/red (semantic status)
      if (u.hueGroup === 'green' || u.hueGroup === 'teal' || u.hueGroup === 'amber' || (u.hueGroup === 'red' && !likelyBrandColors.some((b) => b.normalizedHex === u.normalizedHex))) {
        semanticCount += u.frequency;
      } else if (likelyBrandColors.some((b) => b.normalizedHex === u.normalizedHex) || u.isInteractive) {
        accentCount += u.frequency;
      } else {
        decorativeCount += u.frequency;
      }
    }
  }

  const total = Math.max(1, neutralCount + accentCount + semanticCount + decorativeCount);
  const neutralPercentage = Math.round((neutralCount / total) * 100);
  const accentPercentage = Math.round((accentCount / total) * 100);
  const semanticPercentage = Math.round((semanticCount / total) * 100);
  const decorativePercentage = Math.round((decorativeCount / total) * 100);

  const distribution: ColorDistribution = {
    neutralPercentage,
    accentPercentage,
    semanticPercentage,
    decorativePercentage,
    assessment: {
      neutral: neutralPercentage >= 65 ? 'Strong' : neutralPercentage >= 45 ? 'Balanced' : 'Weak',
      accent: accentPercentage > 25 ? 'Excessive' : accentPercentage > 15 ? 'Overused' : accentPercentage >= 4 ? 'Appropriate' : 'Scarce',
      secondaryAccents: brandList.length > 3 ? 'Too many' : brandList.length >= 2 ? 'Controlled' : 'None',
      semantic: semanticPercentage > 0 ? 'Appropriate' : 'Missing',
      decorative: decorativePercentage > 15 ? 'Excessive' : decorativePercentage > 5 ? 'Moderate' : 'Subtle',
    },
  };

  const dominantColors = usages.slice(0, 6).map((u) => u.normalizedHex);

  return {
    roles,
    likelyBrandColors,
    distribution,
    dominantColors,
  };
}
