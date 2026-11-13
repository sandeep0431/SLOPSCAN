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
  | 'motion';

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

export interface Issue {
  id: string;
  ruleId: string;
  category: Category;
  title: string;
  severity: Severity;
  confidence: Confidence;
  evidence: string;
  recommendation: string;
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

export interface AuditSummary {
  highPriorityCount: number;
  mediumPriorityCount: number;
  reviewCount: number;
  totalElementsScanned: number;
  visibleElementsCount: number;
  auditSignal: number;
}

export interface ScanResult {
  page: PageSnapshot;
  sections: SectionSnapshot[];
  issues: Issue[];
  summary: AuditSummary;
  typography: TypographyAnalysis;
}

// Extension Messaging Protocol
export type ExtensionMessage =
  | { type: 'SCAN_PAGE' }
  | { type: 'SCAN_PAGE_SUCCESS'; payload: ScanResult }
  | { type: 'SCAN_PAGE_ERROR'; error: string }
  | { type: 'INSPECT_ELEMENT'; selector: string; elementId: string; issue: Issue }
  | { type: 'CLEAR_INSPECTION' };

