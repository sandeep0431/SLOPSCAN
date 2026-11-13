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

  // Track penalty with cluster protection (max penalty per rule type)
  const penaltyByRule = new Map<string, number>();

  for (const issue of issues) {
    if (issue.severity === 'high') highPriorityCount++;
    else if (issue.severity === 'medium') mediumPriorityCount++;
    else reviewCount++;

    const catPenalty = issue.severity === 'high' ? 12 : issue.severity === 'medium' ? 7 : 4;
    categoryScores[issue.category] = Math.max(35, categoryScores[issue.category] - catPenalty);

    // Severity base
    let baseWeight = 2;
    if (issue.severity === 'high') baseWeight = 8;
    else if (issue.severity === 'medium') baseWeight = 4;

    // Confidence multiplier
    let mult = 1.0;
    if (issue.confidence === 'medium') mult = 0.7;
    else if (issue.confidence === 'review') mult = 0.3;

    const penalty = baseWeight * mult;
    const current = penaltyByRule.get(issue.ruleId) || 0;

    // Cluster cap: no single rule can deduct more than 16 points
    if (current < 16) {
      penaltyByRule.set(issue.ruleId, Math.min(16, current + penalty));
    }
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
