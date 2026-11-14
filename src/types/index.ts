export type Severity = 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'review';

export type Category =
  | 'surfaces'
  | 'spacing'
  | 'typography'
  | 'icons'
  | 'copy'
  | 'components'
  | 'layout'
  | 'motion'
  | 'colors';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ComputedStyleSnapshot {
  // Color & Surfaces
  color: string;
  backgroundColor: string;
  resolvedBackgroundColor?: string;
  backgroundImage: string;
  backgroundClip: string;
  webkitBackgroundClip?: string;
  boxShadow: string;
  filter: string;
  backdropFilter: string;
  opacity: string;

  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
  textDecoration: string;
  textShadow: string;

  // Spacing & Box Model
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  gap: string;

  // Borders & Shape
  borderRadius: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;

  // Layout & Positioning
  display: string;
  position: string;
  zIndex: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;

  // Motion
  animationName: string;
  animationDuration: string;
  animationIterationCount: string;
  transitionProperty: string;
  transitionDuration: string;
}

export interface ElementSnapshot {
  id: string;
  tagName: string;
  role?: string;
  selector: string;
  text: string;
  directText: string;
  rect: BoundingBox;
  computedStyle: ComputedStyleSnapshot;
  parentSelector?: string;
  childrenCount: number;
  sectionId?: string;
  sectionName?: string;
  isInteractive: boolean;
}

export interface SectionSnapshot {
  id: string;
  name: string;
  selector: string;
  rect: BoundingBox;
  elementCount: number;
}

export interface PageSnapshot {
  url: string;
  domain: string;
  title: string;
  metaDescription?: string;
  viewport: {
    width: number;
    height: number;
    scrollHeight: number;
    devicePixelRatio: number;
  };
  colorScheme: 'light' | 'dark';
  totalElementsCount: number;
  visibleElementsCount: number;
  scannedAt: number;
}

export interface ScanContext {
  page: PageSnapshot;
  elements: ElementSnapshot[];
  sections: SectionSnapshot[];
}

export interface IssueDiff {
  remove: string;
  add: string;
}

export interface Issue {
  id: string;
  ruleId: string;
  category: Category;
  title: string;
  severity: Severity;
  confidence: Confidence;
  evidence: string;
  recommendation: string;
  diff?: IssueDiff;
  selector?: string;
  section?: string;
  elementIds: string[];
}

export interface Rule {
  id: string;
  name: string;
  category: Category;
  description: string;
  defaultSeverity: Severity;
  defaultConfidence: Confidence;
  run: (context: ScanContext) => Issue[];
}

export interface TypographyAnalysis {
  distinctFamilies: string[];
  distinctSizes: { size: string; count: number }[];
  distinctWeights: { weight: string; count: number }[];
  primaryHeadingFamily?: string;
  bodyFamily?: string;
  recommendations: {
    preserve: string;
    simplify: string;
    suggested: {
      category: string;
      headingFont: string;
      bodyFont: string;
      monoFont?: string;
      reason: string;
    };
    alternative: {
      headingFont: string;
      bodyFont: string;
      reason: string;
    };
  };
}

export interface ColorUsage {
  color: string;
  normalizedHex: string;
  source: 'text' | 'background' | 'border' | 'shadow' | 'icon' | 'gradient';
  frequency: number;
  elementCount: number;
  selectors: string[];
  elementIds: string[];
  sections: string[];
  isInteractive: boolean;
  isSaturated: boolean;
  isNeutral: boolean;
  luminance: number;
  hueGroup: string;
}

export interface ColorRole {
  role:
    | 'canvas'
    | 'surface'
    | 'surface-subtle'
    | 'surface-raised'
    | 'text-primary'
    | 'text-secondary'
    | 'text-muted'
    | 'border'
    | 'border-strong'
    | 'primary-accent'
    | 'secondary-accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'decorative';
  color: string;
  normalizedHex: string;
  confidence: Confidence;
  evidence: string[];
}

export interface BrandColorCandidate {
  color: string;
  normalizedHex: string;
  confidence: Confidence;
  role: string;
  evidence: string[];
}

export interface ColorDistribution {
  neutralPercentage: number;
  accentPercentage: number;
  semanticPercentage: number;
  decorativePercentage: number;
  assessment: {
    neutral: 'Weak' | 'Balanced' | 'Strong';
    accent: 'Scarce' | 'Appropriate' | 'Overused' | 'Excessive';
    secondaryAccents: 'None' | 'Controlled' | 'Too many';
    semantic: 'Appropriate' | 'Misused' | 'Missing';
    decorative: 'Subtle' | 'Moderate' | 'Excessive';
  };
}

export interface ColorSystemAnalysis {
  productContext: string;
  dominantColors: string[];
  likelyBrandColors: BrandColorCandidate[];
  roles: ColorRole[];
  distribution: ColorDistribution;
  recommendations: {
    preserve: string[];
    reduceOrRemove: string[];
    establish: {
      canvas: string;
      surface: string;
      surfaceRaised: string;
      textPrimary: string;
      textSecondary: string;
      textMuted: string;
      border: string;
      primaryAccent: string;
      accentHover: string;
      success: string;
      warning: string;
      error: string;
    };
    rules: string[];
  };
}

export interface AuditSummary {
  highPriorityCount: number;
  mediumPriorityCount: number;
  reviewCount: number;
  totalElementsScanned: number;
  visibleElementsCount: number;
  auditSignal: number;
  categoryScores: Record<Category, number>;
}

export interface ScanResult {
  page: PageSnapshot;
  sections: SectionSnapshot[];
  issues: Issue[];
  summary: AuditSummary;
  typography: TypographyAnalysis;
  colorSystem: ColorSystemAnalysis;
}

// Extension Messaging Protocol
export type ExtensionMessage =
  | { type: 'SCAN_PAGE' }
  | { type: 'SCAN_PAGE_SUCCESS'; payload: ScanResult }
  | { type: 'SCAN_PAGE_ERROR'; error: string }
  | { type: 'INSPECT_ELEMENT'; selector: string; elementId: string; issue: Issue }
  | { type: 'CLEAR_INSPECTION' }
  | { type: 'SIMULATE_FIX'; selector: string; elementId: string; issueId: string; ruleId: string; active: boolean };

