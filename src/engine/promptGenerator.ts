import type { ScanResult, Issue } from '../types/index.ts';

export function generateFixPrompt(scanResult: ScanResult): string {
  const { page, issues, summary, typography } = scanResult;

  // Group issues by section
  const sectionMap = new Map<string, Issue[]>();
  for (const issue of issues) {
    const sec = issue.section || 'General Interface';
    if (!sectionMap.has(sec)) {
      sectionMap.set(sec, []);
    }
    sectionMap.get(sec)!.push(issue);
  }

  // Sort issues inside sections by severity: high first
  for (const list of sectionMap.values()) {
    list.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });
  }

  let prompt = `# Task: Refine Frontend UI Craft & Eliminate Generic Tropes\n\n`;
  prompt += `**Target Site**: ${page.domain} (${page.url})\n`;
  prompt += `**Audit Summary**: ${summary.highPriorityCount} High Priority Findings, ${summary.mediumPriorityCount} Improvements, ${summary.reviewCount} Review Items\n\n`;

  prompt += `## Role & Constraints\n`;
  prompt += `Act as an expert frontend engineer and senior UI designer.\n`;
  prompt += `Your goal is to eliminate generic UI tropes ("vibe-coded" aesthetics, neon glows, gradient text, excessive pills, buzzwords) and implement clean, disciplined interface craft.\n\n`;

  prompt += `### Non-Negotiable Guardrails:\n`;
  prompt += `1. **Preserve Functionality**: Do NOT remove working controls, authentication flows, forms, or APIs.\n`;
  prompt += `2. **Preserve Purpose & Real Content**: Do NOT invent fictitious testimonials, fake customer logos, or placeholder metrics.\n`;
  prompt += `3. **No Wholesale Redesign**: Only refine the flagged sections and components. Keep the existing architecture intact.\n`;
  prompt += `4. **Quiet Surfaces & Contrast**: Replace saturated neon glows and hue gradients with crisp borders, deliberate spacing, and tonal contrast.\n\n`;

  prompt += `## Implementation Sequence\n`;
  prompt += `Follow this precise implementation order:\n`;
  prompt += `1. Spacing & Grid Alignment\n`;
  prompt += `2. Surfaces & Colors (strip colored glows, replace gradient text)\n`;
  prompt += `3. Icons & Visual Details (replace decorative emojis with consistent SVG icons)\n`;
  prompt += `4. Copywriting (replace hype buzzwords with concrete facts)\n`;
  prompt += `5. Typography Scale & Weights\n`;
  prompt += `6. Component Geometry (standardize border radius)\n`;
  prompt += `7. Motion & Interaction (remove infinite ambient keyframe loops)\n\n`;

  prompt += `## Section-by-Section Findings & Concrete Fixes\n\n`;

  for (const [sectionName, secIssues] of sectionMap.entries()) {
    prompt += `### Section: ${sectionName.toUpperCase()}\n\n`;
    for (const issue of secIssues) {
      const tag = issue.severity.toUpperCase();
      prompt += `#### [${tag}] ${issue.title}\n`;
      if (issue.selector) {
        prompt += `- **Target Element**: \`${issue.selector}\`\n`;
      }
      prompt += `- **Evidence**: ${issue.evidence}\n`;
      prompt += `- **Prescribed Fix**: ${issue.recommendation}\n\n`;
    }
    prompt += `---\n\n`;
  }

  prompt += `## Typographic Standardization\n`;
  prompt += `- **Active Families**: ${typography.distinctFamilies.join(', ')}\n`;
  prompt += `- **Preserve**: ${typography.recommendations.preserve}\n`;
  prompt += `- **Simplify**: ${typography.recommendations.simplify}\n`;
  prompt += `- **Suggested Pairing**: Headings: ${typography.recommendations.suggested.headingFont} | Body: ${typography.recommendations.suggested.bodyFont} (${typography.recommendations.suggested.reason})\n\n`;

  // Color System Refinement Section
  if (scanResult.colorSystem) {
    const cs = scanResult.colorSystem;
    prompt += `## Color System Refinement\n\n`;
    prompt += `> **Design Principle**: Refine the existing color system, do not erase the product's identity.\n\n`;
    prompt += `### Product Context Detected\n`;
    prompt += `- **Archetype**: ${cs.productContext}\n`;
    prompt += `- **Surface Assessment**: Neutral: ${cs.distribution.assessment.neutral} (${cs.distribution.neutralPercentage}%) | Accent: ${cs.distribution.assessment.accent} (${cs.distribution.accentPercentage}%) | Decorative: ${cs.distribution.assessment.decorative} (${cs.distribution.decorativePercentage}%)\n\n`;

    if (cs.recommendations.preserve.length > 0) {
      prompt += `### Preserve\n`;
      for (const item of cs.recommendations.preserve) {
        prompt += `- ${item}\n`;
      }
      prompt += `\n`;
    }

    if (cs.recommendations.reduceOrRemove.length > 0) {
      prompt += `### Reduce or Remove\n`;
      for (const item of cs.recommendations.reduceOrRemove) {
        prompt += `- ${item}\n`;
      }
      prompt += `\n`;
    }

    prompt += `### Establish Semantic Design Tokens\n`;
    prompt += `Standardize colors into CSS custom properties to replace ad-hoc inline and utility colors:\n\n`;
    prompt += `\`\`\`css\n`;
    prompt += `:root {\n`;
    prompt += `  /* Surfaces & Canvas */\n`;
    prompt += `  --canvas: ${cs.recommendations.establish.canvas};\n`;
    prompt += `  --surface: ${cs.recommendations.establish.surface};\n`;
    prompt += `  --surface-raised: ${cs.recommendations.establish.surfaceRaised};\n`;
    prompt += `  --border: ${cs.recommendations.establish.border};\n\n`;
    prompt += `  /* Typography Hierarchy */\n`;
    prompt += `  --text-primary: ${cs.recommendations.establish.textPrimary};\n`;
    prompt += `  --text-secondary: ${cs.recommendations.establish.textSecondary};\n`;
    prompt += `  --text-muted: ${cs.recommendations.establish.textMuted};\n\n`;
    prompt += `  /* Interactive Brand Accent (Preserved) */\n`;
    prompt += `  --color-primary: ${cs.recommendations.establish.primaryAccent};\n`;
    prompt += `  --color-primary-hover: ${cs.recommendations.establish.accentHover};\n\n`;
    prompt += `  /* Semantic Feedback */\n`;
    prompt += `  --color-success: ${cs.recommendations.establish.success};\n`;
    prompt += `  --color-warning: ${cs.recommendations.establish.warning};\n`;
    prompt += `  --color-error: ${cs.recommendations.establish.error};\n`;
    prompt += `}\n`;
    prompt += `\`\`\`\n\n`;

    prompt += `### Color System Guardrails\n`;
    for (const rule of cs.recommendations.rules) {
      prompt += `1. ${rule}\n`;
    }
    prompt += `\n`;
  }

  prompt += `## Completion Verification\n`;
  prompt += `After applying these refinements, verify that:\n`;
  prompt += `- The interface renders with calm, professional confidence.\n`;
  prompt += `- Headings use solid colors and consistent weights.\n`;
  prompt += `- Border radius follows an orderly token scale.\n`;
  prompt += `- All interactive buttons have clear, tactile hover/focus states without blurred neon halos.\n`;

  return prompt;
}
