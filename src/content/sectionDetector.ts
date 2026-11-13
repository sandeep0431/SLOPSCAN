import { SectionSnapshot, BoundingBox } from '../types/index.ts';

export function detectSections(): SectionSnapshot[] {
  const sections: SectionSnapshot[] = [];
  const handledElements = new Set<Element>();

  // 1. Semantic landmarks
  const semanticSelectors = [
    { name: 'Navigation', sel: 'header, nav, [role="banner"], [role="navigation"]' },
    { name: 'Hero', sel: '[class*="hero" i], [id*="hero" i]' },
    { name: 'Features', sel: '[class*="feature" i], [id*="feature" i]' },
    { name: 'Pricing', sel: '[class*="pricing" i], [id*="pricing" i]' },
    { name: 'Testimonials', sel: '[class*="testimonial" i], [id*="testimonial" i], [class*="review" i]' },
    { name: 'Footer', sel: 'footer, [role="contentinfo"]' },
    { name: 'Content', sel: 'main, article, section' },
  ];

  let idCounter = 1;

  for (const { name, sel } of semanticSelectors) {
    const nodes = document.querySelectorAll(sel);
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      if (handledElements.has(el)) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      handledElements.add(el);

      const bbox: BoundingBox = {
        x: Math.round(rect.x),
        y: Math.round(rect.y + window.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top + window.scrollY),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom + window.scrollY),
        left: Math.round(rect.left),
      };

      sections.push({
        id: `sec-${idCounter++}`,
        name: name,
        selector: generateUniqueSelector(el),
        rect: bbox,
        elementCount: el.querySelectorAll('*').length,
      });
    }
  }

  // Fallback: If no sections detected, treat entire body as "Main Content"
  if (sections.length === 0) {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    sections.push({
      id: 'sec-main',
      name: 'Main Content',
      selector: 'body',
      rect: {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: docHeight,
        top: 0,
        right: window.innerWidth,
        bottom: docHeight,
        left: 0,
      },
      elementCount: document.body.querySelectorAll('*').length,
    });
  }

  return sections;
}

export function generateUniqueSelector(el: Element): string {
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }
  const tag = el.tagName.toLowerCase();
  if (tag === 'body' || tag === 'html') return tag;

  const classes = Array.from(el.classList)
    .filter((c) => !/^(active|hover|focus|selected|open|closed)/i.test(c))
    .slice(0, 2);

  if (classes.length > 0) {
    const classStr = classes.map((c) => `.${CSS.escape(c)}`).join('');
    try {
      if (document.querySelectorAll(`${tag}${classStr}`).length === 1) {
        return `${tag}${classStr}`;
      }
    } catch {
      // fallback
    }
  }

  // Parent path
  const parent = el.parentElement;
  if (!parent || parent.tagName === 'HTML') return tag;

  const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  const index = siblings.indexOf(el) + 1;
  const parentTag = parent.tagName.toLowerCase();
  return `${parentTag} > ${tag}:nth-of-type(${index})`;
}

