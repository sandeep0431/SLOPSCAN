import test from 'node:test';
import assert from 'node:assert';
import { runAudit } from '../src/engine/index.ts';
import { generateFixPrompt } from '../src/engine/promptGenerator.ts';
import { analyzeTypography } from '../src/engine/typographyAnalysis.ts';

function createMockContext(elements = [], title = 'Sample SaaS App') {
  return {
    page: {
      url: 'https://example.com',
      domain: 'example.com',
      title,
      metaDescription: 'Supercharge your team with the next-level AI platform.',
      viewport: { width: 1440, height: 900, scrollHeight: 2400, devicePixelRatio: 1 },
      colorScheme: 'dark',
      totalElementsCount: elements.length + 10,
      visibleElementsCount: elements.length,
      scannedAt: Date.now(),
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
  return {
    id,
    tagName: 'DIV',
    selector: `#${id}`,
    text: 'Button Text',
    directText: 'Button Text',
    rect: { x: 100, y: 100, width: 180, height: 44, top: 100, right: 280, bottom: 144, left: 100 },
    computedStyle: {
      color: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(24, 24, 27)',
      backgroundImage: 'none',
      backgroundClip: 'border-box',
      boxShadow: 'none',
      filter: 'none',
      backdropFilter: 'none',
      opacity: '1',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      fontWeight: '500',
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
      gap: '8px',
      borderRadius: '6px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgb(39, 39, 42)',
      display: 'inline-flex',
      position: 'relative',
      zIndex: '1',
      animationName: 'none',
      animationDuration: '0s',
      animationIterationCount: '0',
      transitionProperty: 'none',
      transitionDuration: '0s',
    },
    childrenCount: 0,
    sectionId: 'sec-hero',
    sectionName: 'Hero',
    isInteractive: false,
    ...overrides,
  };
}

test('Rule R001: Detects hue gradient backgrounds on containers', () => {
  const el = createMockElement('card', {
    tagName: 'DIV',
    rect: { x: 50, y: 50, width: 320, height: 220, top: 50, right: 370, bottom: 270, left: 50 },
    childrenCount: 3,
    computedStyle: {
      ...createMockElement('dummy').computedStyle,
      backgroundImage: 'linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 100%)',
    },
  });

  const context = createMockContext([el]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R001');
  assert.ok(issue, 'R001 should flag hue gradient background');
  assert.strictEqual(issue.severity, 'medium');
  assert.strictEqual(issue.confidence, 'high');
});

test('Rule R002: Detects gradient text treatment', () => {
  const el = createMockElement('title', {
    tagName: 'H1',
    text: 'Transform Your Workflow Today',
    directText: 'Transform Your Workflow Today',
    computedStyle: {
      ...createMockElement('dummy').computedStyle,
      backgroundImage: 'linear-gradient(to right, rgb(236, 72, 153), rgb(239, 68, 68))',
      backgroundClip: 'text',
      webkitBackgroundClip: 'text',
      color: 'transparent',
    },
  });

  const context = createMockContext([el]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R002');
  assert.ok(issue, 'R002 should be flagged for gradient text');
  assert.strictEqual(issue.severity, 'high');
  assert.strictEqual(issue.confidence, 'high');
  assert.match(issue.evidence, /background-clip: text/);
});

test('Rule R003: Detects excessive colored glow on CTA', () => {
  const el = createMockElement('cta', {
    tagName: 'BUTTON',
    isInteractive: true,
    computedStyle: {
      ...createMockElement('dummy').computedStyle,
      boxShadow: 'rgb(168, 85, 247) 0px 0px 48px 0px',
    },
  });

  const context = createMockContext([el]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R003');
  assert.ok(issue, 'R003 should be flagged for colored glow');
  assert.strictEqual(issue.severity, 'high');
  assert.match(issue.evidence, /48px blur/);
});

test('Rule R011: Detects arbitrary off-grid spacing values', () => {
  const el1 = createMockElement('el1', { computedStyle: { ...createMockElement('d').computedStyle, paddingTop: '17px' } });
  const el2 = createMockElement('el2', { computedStyle: { ...createMockElement('d').computedStyle, marginTop: '23px' } });
  const el3 = createMockElement('el3', { computedStyle: { ...createMockElement('d').computedStyle, paddingBottom: '31px' } });

  const context = createMockContext([el1, el2, el3]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R011');
  assert.ok(issue, 'R011 should flag arbitrary spacing');
  assert.strictEqual(issue.confidence, 'medium');
});

test('Rule R020: Detects too many font families', () => {
  const el1 = createMockElement('e1', { computedStyle: { ...createMockElement('d').computedStyle, fontFamily: 'Inter' } });
  const el2 = createMockElement('e2', { computedStyle: { ...createMockElement('d').computedStyle, fontFamily: 'Playfair Display' } });
  const el3 = createMockElement('e3', { computedStyle: { ...createMockElement('d').computedStyle, fontFamily: 'Comic Sans MS' } });
  const el4 = createMockElement('e4', { computedStyle: { ...createMockElement('d').computedStyle, fontFamily: 'Papyrus' } });

  const context = createMockContext([el1, el2, el3, el4]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R020');
  assert.ok(issue, 'R020 should flag 4 font families');
  assert.strictEqual(issue.severity, 'medium');
});

test('Rule R030 & R032: Detects decorative emoji and sparkles', () => {
  const elEmoji = createMockElement('nav-btn', {
    tagName: 'BUTTON',
    text: '🚀 Launch Project',
    directText: '🚀 Launch Project',
    isInteractive: true,
  });

  const elSparkle = createMockElement('hero-badge', {
    tagName: 'DIV',
    text: '✨ Powered by Magic',
    directText: '✨ Powered by Magic',
  });

  const context = createMockContext([elEmoji, elSparkle]);
  const result = runAudit(context);

  const r30 = result.issues.find((i) => i.ruleId === 'R030');
  const r32 = result.issues.find((i) => i.ruleId === 'R032');

  assert.ok(r30, 'R030 should flag rocket emoji in button');
  assert.ok(r32, 'R032 should flag sparkle ornament');
});

test('Rule R041 & R044: Detects generic hype buzzwords and AI copy', () => {
  const elHype = createMockElement('headline', {
    tagName: 'H1',
    text: 'The Revolutionary Platform to Supercharge Growth',
    directText: 'The Revolutionary Platform to Supercharge Growth',
  });

  const elAi = createMockElement('subtitle', {
    tagName: 'P',
    text: 'Unlock the power of AI effortlessly with 10x speed.',
    directText: 'Unlock the power of AI effortlessly with 10x speed.',
  });

  const context = createMockContext([elHype, elAi]);
  const result = runAudit(context);

  const r41 = result.issues.find((i) => i.ruleId === 'R041');
  const r44 = result.issues.find((i) => i.ruleId === 'R044');

  assert.ok(r41, 'R041 should flag revolutionary/supercharge');
  assert.ok(r44, 'R044 should flag "unlock the power of ai"');
});

test('Rule R050: Detects excessive pill border radius overuse', () => {
  const pills = Array.from({ length: 7 }, (_, i) =>
    createMockElement(`pill-${i}`, {
      computedStyle: {
        ...createMockElement('d').computedStyle,
        borderRadius: '9999px',
      },
    })
  );

  const context = createMockContext(pills);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R050');
  assert.ok(issue, 'R050 should flag excessive pills');
});

test('Rule R060: Detects too many competing hero actions', () => {
  const btn1 = createMockElement('b1', { tagName: 'BUTTON', isInteractive: true });
  const btn2 = createMockElement('b2', { tagName: 'BUTTON', isInteractive: true });
  const btn3 = createMockElement('b3', { tagName: 'BUTTON', isInteractive: true });

  const context = createMockContext([btn1, btn2, btn3]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R060');
  assert.ok(issue, 'R060 should flag 3 competing buttons in hero');
});

test('Rule R070: Detects infinite decorative animation', () => {
  const animatedEl = createMockElement('float-blob', {
    computedStyle: {
      ...createMockElement('d').computedStyle,
      animationName: 'float-up-down',
      animationIterationCount: 'infinite',
    },
  });

  const context = createMockContext([animatedEl]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R070');
  assert.ok(issue, 'R070 should flag infinite decorative animation');
});

test('Typography analysis recommends developer fonts for developer title', () => {
  const context = createMockContext([], 'SuperDB — Distributed Cloud Database & API');
  const analysis = analyzeTypography(context);

  assert.strictEqual(analysis.recommendations.suggested.category, 'Developer & Technical Tooling');
  assert.match(analysis.recommendations.suggested.headingFont, /Space Grotesk|IBM Plex/);
});

test('Scoring and Prompt Generation test', () => {
  const el = createMockElement('cta', {
    tagName: 'BUTTON',
    isInteractive: true,
    computedStyle: {
      ...createMockElement('dummy').computedStyle,
      boxShadow: 'rgb(168, 85, 247) 0px 0px 48px 0px',
    },
  });

  const context = createMockContext([el]);
  const result = runAudit(context);

  assert.ok(result.summary.auditSignal < 100);
  assert.strictEqual(result.summary.highPriorityCount, 1);

  const prompt = generateFixPrompt(result);
  assert.match(prompt, /Preserve Functionality/);
  assert.match(prompt, /Colored Glow/);
  assert.match(prompt, /Implementation Sequence/);
});


test('Rule R005: Detects excessive saturated accent color overuse', () => {
  const elements = Array.from({ length: 7 }, (_, i) =>
    createMockElement(`accent-btn-${i}`, {
      tagName: 'BUTTON',
      isInteractive: true,
      computedStyle: {
        ...createMockElement('d').computedStyle,
        backgroundColor: 'rgb(168, 85, 247)', // saturated purple
      },
    })
  );

  const context = createMockContext(elements);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R005');
  assert.ok(issue, 'R005 should flag saturated accent repetition');
  assert.strictEqual(issue.severity, 'medium');
});

test('Rule R012: Detects inconsistent card padding within section', () => {
  const card1 = createMockElement('card-1', {
    tagName: 'DIV',
    selector: '.feature-card-1',
    childrenCount: 3,
    computedStyle: {
      ...createMockElement('d').computedStyle,
      paddingTop: '24px',
      paddingRight: '24px',
      paddingBottom: '24px',
      paddingLeft: '24px',
    },
  });

  const card2 = createMockElement('card-2', {
    tagName: 'DIV',
    selector: '.feature-card-2',
    childrenCount: 3,
    computedStyle: {
      ...createMockElement('d').computedStyle,
      paddingTop: '12px',
      paddingRight: '12px',
      paddingBottom: '12px',
      paddingLeft: '12px',
    },
  });

  const context = createMockContext([card1, card2]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R012');
  assert.ok(issue, 'R012 should flag mismatched card padding');
  assert.strictEqual(issue.category, 'spacing');
});

test('Rule R023: Detects heavy heading overuse', () => {
  const headings = Array.from({ length: 5 }, (_, i) =>
    createMockElement(`heading-${i}`, {
      tagName: 'H2',
      text: `Heading Section ${i}`,
      directText: `Heading Section ${i}`,
      computedStyle: {
        ...createMockElement('d').computedStyle,
        fontSize: '28px',
        fontWeight: '900',
      },
    })
  );

  const context = createMockContext(headings);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R023');
  assert.ok(issue, 'R023 should flag extreme font weights on all headings');
});

test('Rule R042: Detects generic greeting headline', () => {
  const el = createMockElement('welcome', {
    tagName: 'H1',
    text: 'Welcome back to the Future',
    directText: 'Welcome back to the Future',
  });

  const context = createMockContext([el]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R042');
  assert.ok(issue, 'R042 should flag generic welcome greeting');
});

test('Rule R071: Detects transitions on layout properties', () => {
  const el = createMockElement('drawer', {
    computedStyle: {
      ...createMockElement('d').computedStyle,
      transitionProperty: 'width, height',
      transitionDuration: '0.3s',
    },
  });

  const context = createMockContext([el]);
  const result = runAudit(context);

  const issue = result.issues.find((i) => i.ruleId === 'R071');
  assert.ok(issue, 'R071 should flag layout property transition');
});
