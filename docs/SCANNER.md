# SlopScan DOM & CSS Scanner

## Purpose

The scanner runs within the context of the live target webpage as an injected content script. Its sole responsibility is to extract a deterministic, normalized snapshot of visible interface elements, layout regions, and computed style properties without altering the page or imposing noticeable CPU/memory overhead.

---

## Scanner Lifecycle

```text
[Popup triggers scan]
       │
       ▼ (chrome.tabs.sendMessage)
[Content Script / Scanner]
       │
       ├─ Phase 1: Collect Viewport & Page Metadata (PageSnapshot)
       ├─ Phase 2: Traverse DOM (TreeWalker / querySelectorAll)
       ├─ Phase 3: Filter Invisible / Irrelevant Elements
       ├─ Phase 4: Extract Computed Styles & Bounding Rects (ElementSnapshot)
       ├─ Phase 5: Detect Layout Sections (SectionSnapshot)
       └─ Phase 6: Package ScanContext & Return to Analysis Engine
```

---

## 1. Page Snapshot

Captures global document context:

```ts
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
}
```

---

## 2. Visibility & Filter Heuristics

To maintain high performance and low noise, elements are rejected if they meet any of the following criteria:

### Excluded Tags
- `<script>`, `<style>`, `<noscript>`, `<iframe>`, `<object>`, `<embed>`
- `<template>`, `<svg>` internals (paths, defs, masks; the `<svg>` root itself is analyzed as an icon container)
- `<meta>`, `<link>`, `<head>`, `<title>`

### Excluded States
- `display: none`
- `visibility: hidden`
- `opacity: 0` (unless animated)
- `aria-hidden="true"` when non-interactive and zero-size
- Bounding client rect width == 0 or height == 0 (unless containing absolute visual children)
- Viewport bounds check: Elements located completely outside standard document flow or positioned at extreme off-screen coordinates (e.g. `left: -9999px`)

---

## 3. Element Snapshot Schema

Every analyzed visible element produces an `ElementSnapshot`:

```ts
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
  id: string; // Unique transient UUID or index
  tagName: string;
  role?: string;
  selector: string;
  text: string;
  directText: string; // Text node direct children only
  rect: BoundingBox;
  computedStyle: ComputedStyleSnapshot;
  parentSelector?: string;
  childrenCount: number;
  sectionId?: string;
  isInteractive: boolean; // button, a, input, select, textarea, role="button", onclick
}
```

---

## 4. Section Detection Algorithm

Pages are partitioned into semantic regions to ground findings in context:

### Priority 1: Semantic HTML5 Elements
1. `<header>` → `Navigation` or `Header`
2. `<nav>` → `Navigation`
3. `<main>` → Core content region
4. `<section>`, `<article>`, `<aside>`
5. `<footer>` → `Footer`

### Priority 2: Semantic ARIA Roles
- `role="banner"`
- `role="navigation"`
- `role="main"`
- `role="complementary"`
- `role="contentinfo"`

### Priority 3: Geometric & Heading Fallback
When semantic landmarks are missing:
- Detect `<h1>`, `<h2>`, `<h3>` tags with high visual prominence.
- Slice the page along vertical bounding boundaries (`top` / `bottom`).
- Assign elements to nearest bounding section container.
- Map sections to common product patterns:
  - `Hero`: Uppermost prominent section containing `h1` and primary CTA
  - `Features`: Repeated card grids following the hero
  - `Pricing`: Tables or cards with currency symbols / tier names
  - `Testimonials`: Quote blocks or avatar-bearing cards
  - `Footer`: Bottom-most landmark

```ts
export interface SectionSnapshot {
  id: string;
  name: string; // e.g., "Hero", "Navigation", "Features", "Pricing", "Footer"
  selector: string;
  rect: BoundingBox;
  elementCount: number;
}
```

---

## 5. Performance & Safety Guards

To prevent UI freezing on huge Single Page Applications (SPAs):
1. **Element Cap**: Scan a maximum of 1,200 prominent visible elements per run.
2. **Batching**: Use `requestIdleCallback` or chunked microtasks if DOM exceeds 3,000 nodes.
3. **Cache Computed Styles**: Avoid redundant `getComputedStyle()` calls on identical deeply-nested elements when styles inherit transparently.
4. **Read-Only Invariant**: The scanner never mutates the DOM during collection. Stylesheets, inline styles, and class lists remain untouched.

---

## 6. Visual Inspector Overlay Mechanics

When an issue is selected in the popup dashboard, the content script renders an unobtrusive inspection overlay:

1. **Highlight Box**:
   - Outlines the target element using an absolute canvas or SVG layer.
   - Highlights the element without disrupting document geometry (using `box-sizing: border-box`, `pointer-events: none`).
2. **Context Dimming**:
   - Soft 10% opacity backdrop over non-target regions to direct focus.
3. **Element Tooltip / Callout**:
   - Positioned adjacent to the highlighted element.
   - Displays issue category, confidence badge, concise evidence, and recommendation.
   - Includes a dismiss / close button and escape key handler (`Escape` dismisses highlight).

