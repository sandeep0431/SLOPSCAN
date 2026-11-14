import test from 'node:test';
import assert from 'node:assert';
import { runAudit } from '../src/engine/index.ts';
import { generateFixPrompt } from '../src/engine/promptGenerator.ts';
import { parseAndNormalizeColor, calculateContrast, areColorsVisuallyEquivalent } from '../src/engine/color/colorNormalizer.ts';
import { inferProductContext } from '../src/engine/color/colorRoleAnalyzer.ts';
import { extractPageColors } from '../src/engine/color/colorExtractor.ts';

function createMockContext(elements = [], overrides = {}) {
  return {
    page: {
      url: 'https://example.com',
      domain: 'example.com',
      title: 'NextGen Cloud Platform',
      metaDescription: 'Scalable developer infrastructure and real-time cloud data.',
      viewport: { width: 1440, height: 900, scrollHeight: 2400, devicePixelRatio: 1 },
      colorScheme: 'dark',
      totalElementsCount: elements.length + 10,
      visibleElementsCount: elements.length,
      scannedAt: Date.now(),
      ...overrides,
    },
    sections: [
      {
        id: 'sec-hero',
        name: 'Hero',
        selector: '.hero-container',
        rect: { x: 0, y: 0, width: 1440, height: 600, top: 0, right: 1440, bottom: 600, left: 0 },
        elementCount: elements.length,
      },
    ],
    elements,
  };
}

function createMockElement(id, overrides = {}) {
  const defaults = {
    id,
    tagName: 'DIV',
    selector: `#${id}`,
    text: 'Interface copy',
    directText: 'Interface copy',
    rect: { x: 100, y: 100, width: 200, height: 50, top: 100, right: 300, bottom: 150, left: 100 },
    computedStyle: {
      color: 'rgb(248, 250, 252)',
      backgroundColor: 'rgb(15, 23, 42)',
      backgroundImage: 'none',
      backgroundClip: 'border-box',
      boxShadow: 'none',
      filter: 'none',
      backdropFilter: 'none',
      opacity: '1',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
      letterSpacing: '0px',
      textTransform: 'none',
      textDecoration: 'none',
      textShadow: 'none',
      paddingTop: '12px',
      paddingRight: '16px',
      paddingBottom: '12px',
      paddingLeft: '16px',
      marginTop: '0px',
      marginRight: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      borderTopWidth: '1px',
      borderRightWidth: '1px',
      borderBottomWidth: '1px',
      borderLeftWidth: '1px',
      borderTopStyle: 'solid',
      borderRightStyle: 'solid',
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderTopColor: 'rgb(30, 41, 59)',
      borderRightColor: 'rgb(30, 41, 59)',
      borderBottomColor: 'rgb(30, 41, 59)',
      borderLeftColor: 'rgb(30, 41, 59)',
      borderTopLeftRadius: '6px',
      borderTopRightRadius: '6px',
      borderBottomRightRadius: '6px',
      borderBottomLeftRadius: '6px',
      transitionDuration: '0.15s',
      animationName: 'none',
    },
    isInteractive: false,
    sectionName: 'Hero',
  };

  return {
    ...defaults,
    ...overrides,
    computedStyle: {
      ...defaults.computedStyle,
      ...(overrides.computedStyle || {}),
    },
  };
}

test('Color Normalizer: Parses and normalizes hex, rgb, and calculates contrast', () => {
  const white = parseAndNormalizeColor('rgb(255, 255, 255)');
  const black = parseAndNormalizeColor('#000000');
  const indigo = parseAndNormalizeColor('rgba(99, 102, 241, 1)');

  assert.strictEqual(white?.hex, '#FFFFFF');
  assert.strictEqual(black?.hex, '#000000');
  assert.strictEqual(indigo?.hex, '#6366F1');

  const contrast = calculateContrast(white.luminance, black.luminance);
  assert.strictEqual(Math.round(contrast), 21); // Maximum contrast is 21:1

  // Visual equivalence
  assert.strictEqual(areColorsVisuallyEquivalent('#6366F1', '#6466F2'), true);
  assert.strictEqual(areColorsVisuallyEquivalent('#6366F1', '#EF4444'), false);
});

test('Product Context: Infers Healthcare vs Finance vs DevTool vs Creative Portfolio', () => {
  const healthCtx = createMockContext([], { title: 'MaternalRisk AI • Clinical Decision Intelligence' });
  assert.ok(inferProductContext(healthCtx).includes('Healthcare'));

  const financeCtx = createMockContext([], { title: 'Crypto Wealth & Portfolio Trading' });
  assert.ok(inferProductContext(financeCtx).includes('Finance'));

  const devCtx = createMockContext([], { title: 'Kubernetes CLI and Developer Terminal' });
  assert.ok(inferProductContext(devCtx).includes('Developer'));

  const creativeCtx = createMockContext([], { title: 'Studio Portfolio • Art Direction & Photography' });
  assert.ok(inferProductContext(creativeCtx).includes('Creative Portfolio'));
});

test('Color Rules: C001 flags competing accents, but spares Creative Portfolio', () => {
  // Elements with 3 competing saturated accents: bright blue, neon orange, and hot pink
  const elements = [
    createMockElement('btn1', {
      isInteractive: true,
      tagName: 'BUTTON',
      computedStyle: { backgroundColor: 'rgb(59, 130, 246)' }, // Blue
    }),
    createMockElement('btn2', {
      isInteractive: true,
      tagName: 'BUTTON',
      computedStyle: { backgroundColor: 'rgb(249, 115, 22)' }, // Orange
    }),
    createMockElement('btn3', {
      isInteractive: true,
      tagName: 'BUTTON',
      computedStyle: { backgroundColor: 'rgb(236, 72, 153)' }, // Pink
    }),
  ];

  // Standard SaaS context -> C001 should trigger
  const saasResult = runAudit(createMockContext(elements, { title: 'Cloud SaaS Dashboard' }));
  const c001 = saasResult.issues.find((i) => i.ruleId === 'C001');
  assert.ok(c001, 'C001 should be triggered for 3 competing saturated accents on SaaS');

  // Creative portfolio context -> C001 should NOT trigger (tolerates expressive palettes)
  const portfolioResult = runAudit(createMockContext(elements, { title: 'Design Studio Art Portfolio' }));
  const c001Portfolio = portfolioResult.issues.find((i) => i.ruleId === 'C001');
  assert.strictEqual(c001Portfolio, undefined, 'Creative portfolio should not be flagged for expressive accents');
});

test('Color Rules: C004 flags low contrast text against background', () => {
  const elements = [
    createMockElement('low-contrast-text', {
      text: 'Unreadable light gray text on white background',
      directText: 'Unreadable light gray text on white background',
      computedStyle: {
        color: 'rgb(203, 213, 225)', // light slate (#CBD5E1)
        backgroundColor: 'rgb(255, 255, 255)', // white
      },
    }),
  ];

  const result = runAudit(createMockContext(elements));
  const c004 = result.issues.find((i) => i.ruleId === 'C004');
  assert.ok(c004, 'C004 should be triggered for low contrast text');
  assert.strictEqual(c004.severity, 'high');
});

test('Color Rules: C009 flags routine action button styled in destructive red', () => {
  const elements = [
    createMockElement('cta-btn', {
      tagName: 'BUTTON',
      isInteractive: true,
      text: 'Get Started Free',
      directText: 'Get Started Free',
      computedStyle: {
        backgroundColor: 'rgb(239, 68, 68)', // Destructive red
        color: '#FFFFFF',
      },
    }),
  ];

  const result = runAudit(createMockContext(elements));
  const c009 = result.issues.find((i) => i.ruleId === 'C009');
  assert.ok(c009, 'C009 should trigger when a routine action button uses destructive red');
});

test('Color Rules: C011 flags too many distinct text colors', () => {
  // 8 distinct text colors
  const textColors = [
    'rgb(255, 255, 255)',
    'rgb(241, 245, 249)',
    'rgb(203, 213, 225)',
    'rgb(148, 163, 184)',
    'rgb(100, 116, 139)',
    'rgb(59, 130, 246)',
    'rgb(245, 158, 11)',
    'rgb(168, 85, 247)',
  ];

  const elements = textColors.map((color, idx) =>
    createMockElement(`text-el-${idx}`, {
      text: `Text sample ${idx}`,
      directText: `Text sample ${idx}`,
      computedStyle: {
        color,
        backgroundColor: 'rgb(15, 23, 42)',
      },
    })
  );

  const result = runAudit(createMockContext(elements));
  const c011 = result.issues.find((i) => i.ruleId === 'C011');
  assert.ok(c011, 'C011 should trigger when page has 8 distinct text colors');
  assert.ok(c011.evidence.includes('8 distinct text colors'));
});

test('Color Intelligence: Correctly preserves brand color and populates Fix Prompt', () => {
  // Brand color is a signature Emerald Green (#059669) on primary CTA and logo
  const elements = [
    createMockElement('logo', {
      selector: '.brand-logo',
      text: 'AcmeHealth',
      directText: 'AcmeHealth',
      computedStyle: { color: 'rgb(5, 150, 105)' },
    }),
    createMockElement('main-cta', {
      tagName: 'BUTTON',
      isInteractive: true,
      selector: '.primary-cta-btn',
      text: 'Schedule Consultation',
      directText: 'Schedule Consultation',
      computedStyle: { backgroundColor: 'rgb(5, 150, 105)', color: '#FFFFFF' },
    }),
  ];

  const result = runAudit(createMockContext(elements, { title: 'AcmeHealth Clinic' }));
  assert.ok(result.colorSystem, 'ScanResult must include colorSystem analysis');

  const brand = result.colorSystem.likelyBrandColors[0];
  assert.ok(brand, 'Should detect primary brand color');
  assert.strictEqual(brand.normalizedHex, '#059669');

  // Verify prompt generation includes color refinement
  const prompt = generateFixPrompt(result);
  assert.ok(prompt.includes('## Color System Refinement'));
  assert.ok(prompt.includes('Primary Brand Identity: #059669'));
  assert.ok(prompt.includes('--color-primary: #059669;'));
  assert.ok(prompt.includes('### Color System Guardrails'));
  assert.ok(prompt.includes('### Token Application Mapping'));
  assert.ok(prompt.includes('### Hex-to-Token Migration Table'));
});

test('Color Rules: C004 ignores empty ghost text and respects resolvedBackgroundColor (Tom de Koning bugfix)', () => {
  // Scenario 1: Empty directText with whitespace - should NOT trigger C004
  const ghostElement = createMockElement('ghost-text', {
    text: '   ',
    directText: '',
    computedStyle: {
      color: '#E7E1D7',
      backgroundColor: 'transparent',
    },
  });

  const res1 = runAudit(createMockContext([ghostElement]));
  const c004_1 = res1.issues.find((i) => i.ruleId === 'C004');
  assert.strictEqual(c004_1, undefined, 'Ghost text with empty directText must not trigger C004');

  // Scenario 2: Light beige text on black resolved background (tree climbed) - should NOT trigger C004
  const lightTextOnDark = createMockElement('portfolio-title', {
    text: 'TOM DE KONING',
    directText: 'TOM DE KONING',
    computedStyle: {
      color: '#E7E1D7', // Light beige
      backgroundColor: 'transparent',
      resolvedBackgroundColor: 'rgb(0, 0, 0)', // Black canvas resolved from body
    },
  });

  const res2 = runAudit(createMockContext([lightTextOnDark]));
  const c004_2 = res2.issues.find((i) => i.ruleId === 'C004');
  assert.strictEqual(c004_2, undefined, 'Contrast between #E7E1D7 and resolved #000000 is > 16:1, must not trigger C004');
});

test('Color Rules: C001 ignores SVG brand icons / logo gradient stops from competing accents (Gemini bugfix)', () => {
  // Scenario: Gemini has 1 primary button (blue), but also an SVG 4-pointed star logo with 5 gradient stops
  const elements = [
    createMockElement('gemini-logo-icon', {
      tag: 'svg',
      tagName: 'SVG',
      selector: '.gemini-star-logo',
      isInteractive: false,
      computedStyle: {
        backgroundImage: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(239, 68, 68), rgb(168, 85, 247))',
      },
    }),
    createMockElement('primary-chat-btn', {
      tag: 'button',
      tagName: 'BUTTON',
      selector: '.chat-submit-btn',
      isInteractive: true,
      rect: { x: 100, y: 100, width: 80, height: 36, top: 100, right: 180, bottom: 136, left: 100 },
      computedStyle: {
        backgroundColor: 'rgb(59, 130, 246)', // Blue primary accent
      },
    }),
  ];

  const res = runAudit(createMockContext(elements, { title: 'Google Gemini' }));
  const c001 = res.issues.find((i) => i.ruleId === 'C001');
  assert.strictEqual(c001, undefined, 'SVG logo gradient must not be counted as competing interactive accents');
});

test('Color Rules: C012 flags many button styles when > 5 variations exist', () => {
  // Create 7 buttons with different height / radius / font-size configurations
  const buttonConfigs = [
    { height: 32, r: '4px', fs: '12px' },
    { height: 36, r: '6px', fs: '13px' },
    { height: 40, r: '8px', fs: '14px' },
    { height: 44, r: '10px', fs: '15px' },
    { height: 48, r: '12px', fs: '16px' },
    { height: 52, r: '16px', fs: '18px' },
    { height: 56, r: '20px', fs: '20px' },
  ];

  const buttons = buttonConfigs.map((cfg, i) =>
    createMockElement(`btn-var-${i}`, {
      tag: 'button',
      tagName: 'BUTTON',
      role: 'button',
      isInteractive: true,
      rect: { x: 50, y: 50 + i * 40, width: 100, height: cfg.height, top: 50, right: 150, bottom: 50 + cfg.height, left: 50 },
      computedStyle: {
        borderRadius: cfg.r,
        fontSize: cfg.fs,
        backgroundColor: '#1E293B',
      },
    })
  );

  const res = runAudit(createMockContext(buttons));
  const c012 = res.issues.find((i) => i.ruleId === 'C012');
  assert.ok(c012, 'C012 should flag button variation proliferation');
  assert.strictEqual(c012.title, 'Many button styles');
  assert.ok(c012.evidence.includes('7 distinct button styles'));
});
