# SlopScan UI & UX Specification

## Philosophy

SlopScan is designed as an **editorial, forensic inspection instrument** rather than a gamified consumer score app. The UI deliberately rejects trendy AI cliches (glowing borders, purple gradients, floating orbs, decorative sparkles) in favor of high-density clarity, structured visual hierarchy, and immediate utility.

---

## 1. Extension Window Dimensions & Shell

- **Default Width**: `420px` (standard Chrome extension popup constraint)
- **Default Height**: `580px` (scrollable content area with sticky header and footer controls)
- **Viewport Behavior**: Clean auto-scroll, sticky tab navigation, zero layout shifts during scan.

---

## 2. Information Architecture

```text
┌──────────────────────────────────────────────────────────┐
│ [●] SLOPSCAN                                  ● LIVE TAB │
│ example.com/pricing                          Scanned now │
├──────────────────────────────────────────────────────────┤
│ [ AUDIT ]               [ TYPE ]             [ FIX PLAN ]│
├──────────────────────────────────────────────────────────┤
│ FINDINGS SUMMARY                                         │
│ [ 04 High Priority ]   [ 11 Improvements ]   [ 06 Review]│
├──────────────────────────────────────────────────────────┤
│ FILTER & GROUPING                                        │
│ Filter: [All Categories ▾]      Group: [By Priority | By Section]│
├──────────────────────────────────────────────────────────┤
│ FINDINGS STREAM                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ HIGH CONFIDENCE • SURFACES                           │ │
│ │ Colored glow on primary call-to-action               │ │
│ │ Section: Hero → Primary CTA (.btn-primary)           │ │
│ │                                                      │ │
│ │ Evidence:                                            │ │
│ │ Saturated purple box-shadow with 48px blur radius.   │ │
│ │                                                      │ │
│ │ Recommendation:                                      │ │
│ │ Replace saturated glow with contrast and scale.      │ │
│ │                                                      │ │
│ │ [ Inspect Element ⌖ ]                                │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ HIGH CONFIDENCE • TYPOGRAPHY                         │ │
│ │ Gradient text on main headline                       │ │
│ │ Section: Hero → H1 (.hero-title)                     │ │
│ │ ...                                                  │ │
├──────────────────────────────────────────────────────────┤
│ [ Rescan Page ⟳ ]            [ Copy Prompt to Clipboard ]│
└──────────────────────────────────────────────────────────┘
```

---

## 3. The Three Primary Modes

### Mode 1: AUDIT (Default)
- **Purpose**: Direct inspection of detected patterns.
- **Top Strip**: Objective counts (`04 High`, `11 Improvements`, `06 Review`).
- **Grouping Toggle**:
  - `By Priority`: Critical visual breaks first.
  - `By Section`: Spatial walkthrough from Navigation to Footer.
- **Finding Item Card**:
  - Border: 1px subtle neutral border (`border-zinc-800` in dark mode).
  - Status Indicator: Small solid dot or discrete tag (`HIGH`, `MEDIUM`, `REVIEW`).
  - Title: Crisp, factual label describing the pattern.
  - Location Breadcrumb: Semantic section + CSS selector or element summary.
  - Evidence Callout: Monospace or muted box describing exact observed values (e.g. `box-shadow: 0 0 40px #a855f7`).
  - Recommendation: One-to-two sentence prescriptive design guidance.
  - Action Button: `[ Inspect Element ]` triggers in-page highlighting and scrolling.

### Mode 2: TYPE (Typography Inspector)
- **Purpose**: Holistic analysis of the typographic hierarchy.
- **Components**:
  - **Font Family Inventory**: Distinct families detected, categorizing body, headings, and code.
  - **Type Scale Distribution**: Histogram/list of computed `font-size` values with occurrences.
  - **Weight System**: Audit of font weights (flagging overuse of 700/800/900).
  - **Preservation Guidance**:
    1. *Preserve & Simplify*: Retain existing brand typeface, prune redundant sizes.
    2. *Suggested Direction*: Context-aware pairing (e.g. Developer, Modern SaaS, Editorial).
    3. *Alternative Option*: Clean fallback pairing.

### Mode 3: FIX PLAN (AI Coding Agent Export)
- **Purpose**: Immediate handoff to AI agents (Cursor, Claude Code, Codex, GitHub Copilot).
- **Components**:
  - Generated Markdown plan formatted for automated consumption.
  - Segmented by page sections.
  - Guardrails included (preserve product purpose, avoid generic redesigns).
  - Action button: `[ Copy Fix Plan ]` with tactile feedback ("Copied to clipboard").

---

## 4. Visual Inspector (In-Page Overlay)

When the user clicks `[ Inspect Element ]`:
1. The extension sends an `INSPECT_ELEMENT` message with `selector` and `elementId`.
2. Content script scrolls the element smoothly into the viewport center (`scrollIntoView({ behavior: 'smooth', block: 'center' })`).
3. An SVG/Canvas spotlight overlay isolates the element:
   - Outline: Crisp 2px bounding box with corner crosshairs.
   - Surrounding Page: 15% dark veil.
4. An attached floating tooltip badge displays:
   - Issue Title & Confidence.
   - Brief evidence.
   - Quick dismiss button (`✕`) or press `Esc`.

---

## 5. Visual System & Tokens

### Palette (Dark Theme First)
- **Canvas / Background**: `#0D0E11` (Deep technical slate)
- **Surface**: `#16181D` (Card and panel backgrounds)
- **Raised Surface**: `#1F222A` (Hover states, input backgrounds)
- **Border Subdued**: `#282C37`
- **Border High Contrast**: `#3E4452`
- **Text Primary**: `#F1F3F5` (High legibility white-grey)
- **Text Secondary**: `#9CA3AF` (Muted metadata)
- **Text Muted**: `#6B7280`

### Status Accents
- **High Severity**: `#F87171` (Crimson / Coral red - used sparingly)
- **Medium Severity**: `#FBBF24` (Amber)
- **Review**: `#60A5FA` (Technical steel blue)
- **Brand Accent**: `#E2E8F0` / `#38BDF8` (Precision Cyan/Silver accent for active states)

### Typography
- **Primary Interface**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Data & Evidence**: JetBrains Mono, "IBM Plex Mono", Menlo, Consolas, monospace

### Corner Radii
- Tags & badges: `3px`
- Action buttons: `6px`
- Cards & dialogs: `8px`
- Inspector badge: `6px`

---

## 6. Interaction Details & States

- **Initial State**: Quick button `[ Scan Open Page ]` with estimated element count or auto-scan upon opening.
- **Scanning State**: Subtle indeterminate progress bar (1.5px high) along the bottom of the header. No cartoonish spinners.
- **Empty State**:
  > "No high-confidence issues detected in 184 visible elements."
  > Provides quick links to review suggested improvements or export the typography inventory.
- **Error State**: Informative inline note if the target tab is restricted (e.g. `chrome://` internal pages or Web Store).

