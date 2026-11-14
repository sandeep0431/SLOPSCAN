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

  for (const issue of issues) {
    if (issue.severity === 'high') highPriorityCount++;
    else if (issue.severity === 'medium') mediumPriorityCount++;
    else reviewCount++;

    // Category deduction tracking (max 8 pts deduction per category)
    const catPenalty = issue.severity === 'high' ? 6 : issue.severity === 'medium' ? 3.5 : 1.5;
    const currentCatDed = categoryDeductions.get(issue.category) || 0;
    categoryDeductions.set(issue.category, Math.min(8, currentCatDed + catPenalty));
  }

  // Update category scores directly from category deductions
  for (const [cat, ded] of categoryDeductions.entries()) {
    categoryScores[cat] = Math.max(70, Math.round(100 - ded));
  }

  // Total deductions is the sum of category deductions (ensures category caps protect overall score)
  let totalDeductions = 0;
  for (const catDed of categoryDeductions.values()) {
    totalDeductions += catDed;
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
