# SlopScan

> **Automated UI Craft Audit & Color Intelligence for Live Websites**

SlopScan is a privacy-first, 100% client-side Chrome Extension that scans any live webpage and identifies measurable signs of generic, over-decorated, inconsistent, or "vibe-coded" interface design.

Instead of outputting an arbitrary percentage score, SlopScan acts as a **precision visual inspection instrument**: evidence-first, interactive, and directly connected to actionable AI coding prompts and design tokens.

---

## 📂 Project Folder Structure

```text
SLOPSCAN/
├── dist/                             # Compiled production Chrome extension (loaded into browser)
│   ├── assets/                       # Minified popup CSS & JS bundles
│   ├── icons/                        # Extension icons (16, 32, 48, 128px)
│   ├── background.js                 # Service worker runtime
│   ├── content.js                    # Injected content script bundle
│   ├── index.html                    # Popup entry HTML
│   └── manifest.json                 # Chrome Manifest V3 declaration
│
├── docs/                             # Comprehensive architectural and rule specifications
│   ├── ARCHITECTURE.md               # Communication protocols & lifecycle
│   ├── BUILD.md                      # Build sequence & roadmap
│   ├── DESIGN.md                     # Evidence-first visual design language
│   ├── RULES.md                      # Formal detection criteria for rules R001–R071
│   ├── SCANNER.md                    # DOM/CSSOM extraction & sectioning heuristics
│   ├── SCORING.md                    # Weighted penalty calculation & score caps
│   ├── PROMPT_GENERATION.md          # Fix prompt structure for AI agents
│   └── TYPOGRAPHY.md                 # Typographic scale & pairing logic
│
├── public/                           # Static assets copied directly to dist during build
│   ├── icons/                        # Source icon images
│   └── manifest.json                 # Source Manifest V3 configuration
│
├── scripts/                          # Automation, build, and packaging toolchain
│   ├── build.js                      # Multi-target Vite compiler (Popup, Content, Background)
│   ├── package-extension.js          # Distribution packager (creates safe production ZIP)
│   └── serve-test-site.js            # Local test fixture server on http://localhost:3333
│
├── src/                              # Full TypeScript source code
│   ├── background/                   # Extension background service worker
│   │   └── index.ts                  # Background lifecycle and tab listeners
│   │
│   ├── content/                      # Content scripts executing in target page context
│   │   ├── domCollector.ts           # Extracts visible elements, computed CSSOM, geometry
│   │   ├── sectionDetector.ts        # Identifies structural regions (Hero, Nav, Cards, Footer)
│   │   ├── inspectorOverlay.ts       # Live in-page element spotlight & visual highlights
│   │   └── index.ts                  # Message listener handling SCAN_PAGE, INSPECT, SIMULATE
│   │
│   ├── engine/                       # Core analytical audit engine (Zero DOM dependencies)
│   │   ├── color/                    # Color Intelligence Engine
│   │   │   ├── colorNormalizer.ts    # Hex/RGB/HSL conversion, WCAG contrast, luminance
│   │   │   ├── colorExtractor.ts     # Extracts text, background, border, gradient, shadow colors
│   │   │   ├── colorRoleAnalyzer.ts  # Archetype detection (Healthcare, Finance, SaaS), brand scoring
│   │   │   ├── colorRules.ts         # Rules C001–C011 (competing accents, text colors, contrast)
│   │   │   └── colorSystemRecommender.ts # Brand preservation & CSS variable token synthesis
│   │   │
│   │   ├── rules/                    # 24 Deterministic Craft Rules
│   │   │   ├── surfaces.ts           # R001 (Hue Gradients), R002 (Gradient Text), R003 (Neon Glows)...
│   │   │   ├── spacing.ts            # R011 (Arbitrary Spacing), R012 (Inconsistent Padding)
│   │   │   ├── typography.ts         # R020 (Font Families), R021 (Font Sizes), R023 (Heading Weight)...
│   │   │   ├── components.ts         # R050 (Everything is a Pill), R051 (Radius System)
│   │   │   ├── icons.ts              # R030 (Decorative Emoji), R032 (Decorative Sparkles)
│   │   │   ├── copy.ts               # R040 (Exclamation), R041 (Hype Copy), R044 (Generic AI Copy)...
│   │   │   ├── layout.ts             # R060 (Too Many Hero Actions)
│   │   │   ├── motion.ts             # R070 (Infinite Animation), R071 (Layout Transitions)
│   │   │   └── index.ts              # Rule registry aggregation
│   │   │
│   │   ├── scoring.ts                # 0–100 craft score calculation with cluster penalty caps
│   │   ├── promptGenerator.ts        # AI Fix Prompt generator with CSS tokens and code diffs
│   │   ├── typographyAnalysis.ts     # Font family, scale distribution, and pairing logic
│   │   └── index.ts                  # Engine entry point (runAudit)
│   │
│   ├── popup/                        # Extension UI (React + Tailwind CSS)
│   │   ├── components/               # Modular UI component hierarchy
│   │   │   ├── PreScanView.tsx       # Launcher screen with mode tabs and "Scan Page" CTA
│   │   │   ├── Header.tsx            # Top header with domain badge, back button, rescan
│   │   │   ├── SummaryStrip.tsx      # Signal score, severity tally, feed/map switch, filters
│   │   │   ├── CraftRadar.tsx        # Architectural craft balance telemetry strip
│   │   │   ├── AuditTab.tsx          # Scrollable findings feed rendering FindingCards
│   │   │   ├── FindingCard.tsx       # Inset metric box, "Try:" advice, visual code diffs, actions
│   │   │   ├── SectionMapView.tsx    # Spatial page map grouping findings by section
│   │   │   ├── TypographyTab.tsx     # Font family audit, active type scale, pairing advice
│   │   │   ├── ColorSystemTab.tsx    # Protected brand swatch, 60-30-10 bar, CSS tokens
│   │   │   └── BottomDeck.tsx        # Sticky action deck (Full fix prompt, view toggles, JSON export)
│   │   │
│   │   ├── App.tsx                   # Main popup coordinator and view controller
│   │   ├── main.tsx                  # React root mount
│   │   └── index.css                 # Global styling and custom scrollbar theme
│   │
│   └── types/                        # Core TypeScript interfaces & protocols
│       └── index.ts                  # ScanContext, Issue, Rule, ColorRole, ColorSystemAnalysis...
│
├── test-fixture/                     # Calibration website for manual testing
│   └── vibe-coded-site.html          # Test fixture with gradients, glows, pills, and copy tropes
│
├── tests/                            # Automated test suite (Native Node.js test runner)
│   ├── engine.test.js                # 17 unit tests verifying R001–R071 and prompt generation
│   └── color.test.js                 # 7 unit tests verifying color intelligence and rules C001–C011
│
├── slopscan-extension.zip            # Clean production distribution ZIP for sharing
├── package.json                      # Dependencies and npm scripts
├── tailwind.config.js                # Custom design tokens, dark surfaces, and color scales
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.ts                    # Vite bundler configuration
```

---

## 🧩 Architectural Pipeline

```text
       LIVE WEBPAGE (DOM + CSSOM)
                   │
                   ▼
  1. Content Script (domCollector.ts)
     • Extracts visible element geometry, computed styles, text, and section containers
                   │
                   ▼
  2. Audit Engine (src/engine/index.ts)
     ├── Color Intelligence (colorExtractor, roleAnalyzer, normalizer)
     │   └── Detects product archetype & protects primary brand color
     ├── Deterministic Rules Engine (R001–R071, C001–C011)
     │   └── Flags measurable craft violations with code diffs
     ├── Typographic Analysis (typographyAnalysis.ts)
     └── Scoring & Penalty Caps (scoring.ts)
                   │
                   ├───────────────────────┬───────────────────────┐
                   ▼                       ▼                       ▼
           3. Extension Popup      4. In-Page Overlay      5. AI Fix Prompt
           • PreScan Launcher      • Element Spotlight     • Section-by-section diffs
           • Craft Feed & Map      • Live CSS Simulator    • Calibrated CSS tokens
           • Color System Tab      (inspectorOverlay.ts)   (promptGenerator.ts)
```

---

## 🛠️ Development & Commands

| Command | Action |
| :--- | :--- |
| `npm run build` | Validates TypeScript with `tsc --noEmit` and bundles extension into `/dist` via Vite |
| `npm run package` | Builds `/dist` and creates clean `slopscan-extension.zip` for sharing |
| `npm test` | Runs the automated unit test suite (24 tests) via Node native test runner |
| `npm run serve:test` | Starts the local test fixture server at `http://localhost:3333` |

---

## 🚀 Installation Guide

### For Developers (from source):
1. Clone this repository:
   ```bash
   git clone https://github.com/sandeep0431/SLOPSCAN.git
   cd SLOPSCAN
   ```
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Open Google Chrome and go to `chrome://extensions`.
4. Enable **"Developer mode"** (top right toggle).
5. Click **"Load unpacked"** and select the [`dist/`](./dist/) folder.

### For End-Users (ZIP distribution):
1. Download [**`slopscan-extension.zip`**](./slopscan-extension.zip) from the repository releases.
2. Unzip it into a folder.
3. Open Chrome → `chrome://extensions` → enable **Developer mode** → click **Load unpacked** and select the unzipped folder.

---

## 🔒 Privacy & Local-First Architecture
- **Zero Cloud Calls**: 100% of DOM extraction, CSS parsing, color intelligence, and prompt generation executes locally in the user's browser.
- **No Analytics / No Tracking**: No external telemetry, user tracking, or third-party API dependencies.

---

## 📄 License & Attribution
SlopScan is licensed under the MIT License. Conceptual design audit rules are inspired by [Unslop](https://github.com/heydamir/unslop) under Creative Commons Attribution 4.0 International (CC BY 4.0). See [`docs/ATTRIBUTION.md`](./docs/ATTRIBUTION.md).
