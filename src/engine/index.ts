import type { ScanContext, ScanResult, Issue, ColorSystemAnalysis } from '../types/index.ts';
import { ALL_RULES } from './rules/index.ts';
import { calculateSummary } from './scoring.ts';
import { analyzeTypography } from './typographyAnalysis.ts';
import { extractPageColors } from './color/colorExtractor.ts';
import { analyzeColorRoles, inferProductContext } from './color/colorRoleAnalyzer.ts';
import { recommendColorSystem } from './color/colorSystemRecommender.ts';

export function runAudit(context: ScanContext): ScanResult {
  const issues: Issue[] = [];

  for (const rule of ALL_RULES) {
    try {
      const detected = rule.run(context);
      issues.push(...detected);
    } catch (err) {
      console.warn(`[SlopScan] Rule ${rule.id} failed:`, err);
    }
  }

  // Sort issues by severity: high first, then medium, then low
  const severityScore = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => severityScore[a.severity] - severityScore[b.severity]);

  const summary = calculateSummary(issues, context);
  const typography = analyzeTypography(context);

  // Compute Color System Intelligence
  const { usages, colorMap } = extractPageColors(context);
  const productContext = inferProductContext(context);
  const { roles, likelyBrandColors, distribution } = analyzeColorRoles(context, usages, colorMap);
  const recommendations = recommendColorSystem(
    context,
    usages,
    roles,
    likelyBrandColors,
    distribution,
    productContext
  );

  const dominantColors = usages
    .slice()
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5)
    .map((u) => u.normalizedHex);

  const colorSystem: ColorSystemAnalysis = {
    productContext,
    dominantColors,
    likelyBrandColors,
    roles,
    distribution,
    recommendations,
  };

  return {
    page: context.page,
    sections: context.sections,
    issues,
    summary,
    typography,
    colorSystem,
  };
}

export * from './scoring.ts';
export * from './typographyAnalysis.ts';
export * from './promptGenerator.ts';
export * from './color/colorExtractor.ts';
export * from './color/colorNormalizer.ts';
export * from './color/colorRoleAnalyzer.ts';
export * from './color/colorSystemRecommender.ts';

