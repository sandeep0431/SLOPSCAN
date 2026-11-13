# SlopScan Build Plan

## Goal

Build a Chrome extension that can inspect the currently open webpage and identify measurable UI patterns associated with generic or inconsistent design.

The first version must work:

- Without an AI API
- Without a backend
- Without a database
- Without sending page data externally

---

# Phase 0 — Project Setup

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Manifest V3

## Required Extension Components

- Popup UI
- Content Script
- Background Service Worker
- Shared Types
- Rule Engine

---

# Phase 1 — Extension Communication

## Goal

Make the popup communicate with the current webpage.

### Flow

Popup
↓
Chrome Runtime Message
↓
Content Script
↓
Scan Current Page
↓
Return Results
↓
Popup Dashboard

## Deliverable

A button:

[ Analyze Website ]

When clicked:

- Get current tab
- Inject or activate scanner
- Collect basic webpage information
- Return result to popup

Example:

```text
Website: example.com
Elements scanned: 327
Visible elements: 184
```

---

# Phase 2 — DOM Collector

## Goal

Create a normalized representation of visible elements.

For each relevant element collect:

```ts
interface ElementSnapshot {
  id: string;

  tagName: string;
  selector: string;

  text: string;

  visible: boolean;

  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  computedStyle: {
    color: string;
    backgroundColor: string;
    backgroundImage: string;

    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    letterSpacing: string;

    paddingTop: string;
    paddingRight: string;
    paddingBottom: string;
    paddingLeft: string;

    marginTop: string;
    marginRight: string;
    marginBottom: string;
    marginLeft: string;

    gap: string;

    borderRadius: string;
    borderColor: string;

    boxShadow: string;

    animationName: string;
    animationIterationCount: string;
  };
}
```

---

# Phase 3 — Visibility Filter

Do not analyze everything.

Ignore:

- display: none
- visibility: hidden
- opacity: 0
- zero-size elements
- script
- style
- metadata
- hidden templates

Only analyze visible interface elements.

---

# Phase 4 — Section Detection

Group the page into meaningful regions.

Priority order:

1. header
2. nav
3. main
4. section
5. article
6. aside
7. footer

If semantic sections are missing:

Use:

- heading positions
- DOM hierarchy
- bounding boxes
- viewport position

Example output:

```text
Navigation
Hero
Features
Pricing
Testimonials
Footer
```

---

# Phase 5 — Rule Engine

Every rule receives:

```ts
interface ScanContext {
  url: string;

  page: PageSnapshot;

  elements: ElementSnapshot[];

  sections: SectionSnapshot[];
}
```

Every rule returns:

```ts
interface Issue {
  id: string;

  ruleId: string;

  category: string;

  title: string;

  severity: "high" | "medium" | "low";

  confidence: "high" | "medium" | "review";

  evidence: string;

  recommendation: string;

  selector?: string;

  section?: string;

  elementIds: string[];
}
```

---

# Phase 6 — First Working Rules

Implement these first:

1. Gradient backgrounds
2. Gradient text
3. Colored glows
4. Emoji decoration
5. Excessive border radius
6. Too many font families
7. Too many font sizes
8. Excessive uppercase labels
9. Hype words
10. Infinite decorative animations

Do not implement 100 rules immediately.

Build → test → calibrate.

---

# Phase 7 — Visual Inspector

The user must be able to click an issue.

Example:

```text
⚠ Colored Glow
Hero → Primary CTA
```

Clicking it should:

1. Scroll to the element
2. Add an inspection outline
3. Dim surrounding elements lightly
4. Display a small annotation

The annotation should contain:

- Issue
- Evidence
- Recommendation

---

# Phase 8 — Dashboard

The dashboard should not be a single percentage.

It should answer:

1. What was found?
2. Where was it found?
3. How confident is the detection?
4. Why is it flagged?
5. What should be done?

Primary dashboard structure:

Overview
↓
Priority Findings
↓
Section Map
↓
Category Breakdown
↓
Typography Direction
↓
Generated Fix Plan

---

# Phase 9 — Prompt Generator

Convert structured issues into a detailed prompt.

The prompt must:

- Preserve functionality
- Preserve product purpose
- Avoid unnecessary redesign
- Use detected evidence
- Group fixes by section
- Prioritize high-confidence issues

---

# Phase 10 — Typography Suggestions

Analyze:

- Existing font families
- Font count
- Product keywords
- Page content
- Interface type

Return:

- Keep current font
- Simplify current system
- Suggested font direction
- Alternative font pair

Do not automatically force a font replacement.

---

# Phase 11 — Testing

Test against:

- SaaS websites
- Portfolios
- Dashboards
- Blogs
- E-commerce
- Documentation sites

Track:

```text
True Positives
False Positives
False Negatives
```

A useful scanner with fewer rules is better than a scanner with 100 inaccurate rules.

---

# Definition of MVP

The MVP is complete when a user can:

1. Open a website
2. Click Analyze
3. See detected issues
4. See where issues occur
5. Highlight an element
6. Read a recommendation
7. See typography suggestions
8. Generate a fix prompt
9. Copy the prompt

No AI API is required.

