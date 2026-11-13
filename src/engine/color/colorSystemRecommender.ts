import type {
  ScanContext,
  ColorUsage,
  ColorRole,
  BrandColorCandidate,
  ColorDistribution,
  ColorSystemAnalysis,
} from '../../types/index.ts';

/**
 * Derives a hover or active shade for a given hex color.
 * For dark colors, slightly lightens; for light/vibrant colors, slightly darkens.
 */
function deriveHoverColor(hex: string): string {
  if (!hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) {
    return '#4F46E5';
  }
  let r: number, g: number, b: number;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  // Slightly darken by 10% for crisp button hover
  const factor = 0.88;
  const hr = Math.max(0, Math.min(255, Math.round(r * factor))).toString(16).padStart(2, '0');
  const hg = Math.max(0, Math.min(255, Math.round(g * factor))).toString(16).padStart(2, '0');
  const hb = Math.max(0, Math.min(255, Math.round(b * factor))).toString(16).padStart(2, '0');

  return `#${hr}${hg}${hb}`.toUpperCase();
}

/**
 * Synthesizes intelligent color system recommendations.
 * Preserves intentional brand and domain identity while establishing clean semantic tokens.
 */
export function recommendColorSystem(
  _context: ScanContext,
  usages: ColorUsage[],
  roles: ColorRole[],
  likelyBrandColors: BrandColorCandidate[],
  distribution: ColorDistribution,
  productContext: string
): ColorSystemAnalysis['recommendations'] {
  const preserve: string[] = [];
  const reduceOrRemove: string[] = [];

  // Determine dark vs light mode canvas
  const canvasRole = roles.find((r) => r.role === 'canvas');
  const isDarkMode = canvasRole ? parseInt(canvasRole.normalizedHex.slice(1, 3), 16) < 80 : true;

  // 1. Brand Preservation
  const primaryBrand = likelyBrandColors[0];
  if (primaryBrand) {
    preserve.push(
      `Primary Brand Identity: ${primaryBrand.normalizedHex} (${primaryBrand.role} - ${primaryBrand.evidence[0] || 'dominant interaction accent'})`
    );
  }

  // Intentional domain patterns
  if (productContext.includes('Healthcare')) {
    preserve.push('Healthcare visual tone: Calm, clinical reassurance with high-contrast readable surfaces.');
  } else if (productContext.includes('Finance')) {
    preserve.push('Financial conventions: Semantic green/red indicators strictly reserved for fiscal performance deltas.');
  } else if (productContext.includes('Developer Tool')) {
    preserve.push('DevTool aesthetic: High-density dark canvas with subdued syntax tokens and low ambient visual noise.');
  } else if (productContext.includes('Creative Portfolio')) {
    preserve.push('Creative identity: Expressive individual project accents preserved on showcased media.');
  }

  if (isDarkMode) {
    preserve.push('Dark theme foundations: High-contrast dark canvas with layered surface depth.');
  } else {
    preserve.push('Light theme foundations: Clean, bright neutral canvas with crisp structural definition.');
  }

  // 2. Reduce or Remove
  // Check for competing saturated accents
  const saturatedUsages = usages.filter((u) => u.isSaturated && u.source !== 'text');
  const distinctHues = Array.from(new Set(saturatedUsages.map((u) => u.hueGroup)));

  if (distinctHues.length >= 3 && !productContext.includes('Creative Portfolio')) {
    reduceOrRemove.push(
      `Competing accent families (${distinctHues.join(', ')}): Standardize on one primary interactive accent color; demote secondary hues to neutral or subtle status tags.`
    );
  }

  // Check for gradient overuse
  const gradientUsages = usages.filter((u) => u.source === 'gradient');
  if (gradientUsages.length >= 2) {
    reduceOrRemove.push(
      'Decorative surface gradients: Replace multi-color linear gradients on cards and text with solid tonal surfaces and crisp 1px borders.'
    );
  }

  // Check for text color fragmentation
  const textUsages = usages.filter((u) => u.source === 'text');
  if (textUsages.length > 5) {
    const textHexes = Array.from(new Set(textUsages.map((u) => u.normalizedHex))).slice(0, 4);
    reduceOrRemove.push(
      `Scattered text colors (${textUsages.length} distinct colors found, e.g. ${textHexes.join(', ')}): Consolidate arbitrary text colors into 3 disciplined tokens (primary, secondary, muted).`
    );
  }

  // Check for colored glows/shadows
  const shadowUsages = usages.filter((u) => u.source === 'shadow' && u.isSaturated);
  if (shadowUsages.length > 0) {
    reduceOrRemove.push(
      'Saturated neon glow shadows: Replace colored drop shadows with subtle neutral occlusion shadows (e.g. rgba(0,0,0,0.25) 0 4px 12px).'
    );
  }

  // Check for random decorative saturation
  if (distribution.decorativePercentage > 10) {
    reduceOrRemove.push(
      'Decorative ambient color noise: Remove blurred background blobs and glowing halos to restore visual quietness.'
    );
  }

  // 3. Establish Semantic Tokens
  const chosenAccent = primaryBrand ? primaryBrand.normalizedHex : '#6366F1';
  const hoverAccent = deriveHoverColor(chosenAccent);

  // Surface tokens calibrated for dark vs light
  const establish = isDarkMode
    ? {
        canvas: roles.find((r) => r.role === 'canvas')?.normalizedHex || '#090B10',
        surface: roles.find((r) => r.role === 'surface')?.normalizedHex || '#0F131F',
        surfaceRaised: roles.find((r) => r.role === 'surface-raised')?.normalizedHex || '#1A2237',
        textPrimary: roles.find((r) => r.role === 'text-primary')?.normalizedHex || '#F8FAFC',
        textSecondary: roles.find((r) => r.role === 'text-secondary')?.normalizedHex || '#94A3B8',
        textMuted: roles.find((r) => r.role === 'text-muted')?.normalizedHex || '#64748B',
        border: roles.find((r) => r.role === 'border')?.normalizedHex || '#1E2538',
        primaryAccent: chosenAccent,
        accentHover: hoverAccent,
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      }
    : {
        canvas: roles.find((r) => r.role === 'canvas')?.normalizedHex || '#FFFFFF',
        surface: roles.find((r) => r.role === 'surface')?.normalizedHex || '#F8FAFC',
        surfaceRaised: roles.find((r) => r.role === 'surface-raised')?.normalizedHex || '#FFFFFF',
        textPrimary: roles.find((r) => r.role === 'text-primary')?.normalizedHex || '#0F172A',
        textSecondary: roles.find((r) => r.role === 'text-secondary')?.normalizedHex || '#475569',
        textMuted: roles.find((r) => r.role === 'text-muted')?.normalizedHex || '#94A3B8',
        border: roles.find((r) => r.role === 'border')?.normalizedHex || '#E2E8F0',
        primaryAccent: chosenAccent,
        accentHover: hoverAccent,
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      };

  // 4. Color System Rules
  const rules = [
    'Maintain 60-30-10 distribution: ~70% neutral canvas & surfaces, ~20% structure & typography, <=10% primary accent.',
    'Treat primary accent as scarce visual currency: reserve strictly for high-intent interactive CTAs and active states.',
    'Ensure all body text maintains minimum 4.5:1 contrast ratio against underlying card surfaces (WCAG AA).',
    'Never use red or destructive styling for routine non-destructive actions; reserve red exclusively for deletion or error states.',
    'Establish consistent 3-tier surface depth (Canvas -> Surface -> Raised Surface) instead of flat identical card backgrounds.',
  ];

  return {
    preserve,
    reduceOrRemove,
    establish,
    rules,
  };
}
