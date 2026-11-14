import type { Issue, AuditSummary, ScanContext, Category } from '../types/index.ts';

export function calculateSummary(issues: Issue[], context: ScanContext): AuditSummary {
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let reviewCount = 0;

  // Track category deductions
  const categoryScores: Record<Category, number> = {
    colors: 100,
    surfaces: 100,
    spacing: 100,
    typography: 100,
    components: 100,
    icons: 100,
    copy: 100,
    layout: 100,
    motion: 100,
  };

  const categoryDeductions = new Map<Category, number>();
  const penaltyByRule = new Map<string, number>();

  for (const issue of issues) {
    if (issue.severity === 'high') highPriorityCount++;
    else if (issue.severity === 'medium') mediumPriorityCount++;
    else reviewCount++;

    // Max penalty per rule cluster
    const maxRuleCap = issue.severity === 'high' ? 8 : issue.severity === 'medium' ? 6 : 2;
    const baseWeight = issue.severity === 'high' ? 8 : issue.severity === 'medium' ? 6 : 2;

    // Confidence multiplier
    let mult = 1.0;
    if (issue.confidence === 'medium') mult = 0.75;
    else if (issue.confidence === 'review') mult = 0.4;

    const penalty = baseWeight * mult;
    const current = penaltyByRule.get(issue.ruleId) || 0;

    // Cluster cap: no single rule can deduct more than its cap
    if (current < maxRuleCap) {
      penaltyByRule.set(issue.ruleId, Math.min(maxRuleCap, current + penalty));
    }

    // Category deduction cap (max 12 pts deduction per category)
    const catPenalty = issue.severity === 'high' ? 6 : issue.severity === 'medium' ? 4 : 2;
    const currentCatDed = categoryDeductions.get(issue.category) || 0;
    categoryDeductions.set(issue.category, Math.min(12, currentCatDed + catPenalty));
  }

  // Update category scores with a soft floor so isolated variations don't crater category health
  for (const [cat, ded] of categoryDeductions.entries()) {
    categoryScores[cat] = Math.max(88, Math.round(100 - ded));
  }

  let totalDeductions = 0;
  for (const p of penaltyByRule.values()) {
    totalDeductions += p;
  }

  const rawScore = Math.max(10, Math.round(100 - totalDeductions));

  return {
    highPriorityCount,
    mediumPriorityCount,
    reviewCount,
    totalElementsScanned: context.page.totalElementsCount,
    visibleElementsCount: context.page.visibleElementsCount,
    auditSignal: rawScore,
    categoryScores,
  };
}
