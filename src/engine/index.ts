import type { ScanContext, ScanResult, Issue } from '../types/index.ts';
import { ALL_RULES } from './rules/index.ts';
import { calculateSummary } from './scoring.ts';
import { analyzeTypography } from './typographyAnalysis.ts';

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

  return {
    page: context.page,
    sections: context.sections,
    issues,
    summary,
    typography,
  };
}

export * from './scoring.ts';
export * from './typographyAnalysis.ts';
export * from './promptGenerator.ts';
