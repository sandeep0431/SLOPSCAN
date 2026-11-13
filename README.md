# SlopScan

> Automated UI Craft Audit for Live Websites

SlopScan is a Chrome extension that scans the currently open website and identifies measurable signs of generic, over-decorated, inconsistent, or "vibe-coded" interface design.

Instead of simply giving a website an arbitrary percentage score (`❌ 68% — Your website is bad`), SlopScan acts as a **professional visual inspection instrument**: evidence-first, interactive, visual, and actionable.

---

## 📁 Blueprint Documentation

The complete architectural, design, and rule specifications are documented in [`docs/`](./docs/):

- [README.md](./docs/README.md) — Project overview & core philosophy
- [BUILD.md](./docs/BUILD.md) — Step-by-step implementation plan & roadmap to MVP
- [RULES.md](./docs/RULES.md) — Detailed detection rule specifications (surfaces, spacing, typography, copy, components, motion)
- [DESIGN.md](./docs/DESIGN.md) — Visual design system & aesthetic guidelines ("Evidence > Score")
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Extension architecture (Popup, Content Script, Rule Engine)
- [SCANNER.md](./docs/SCANNER.md) — DOM/CSS extraction, section detection, and performance heuristics
- [SCORING.md](./docs/SCORING.md) — Weighted scoring engine, confidence multipliers, and score protection
- [PROMPT_GENERATION.md](./docs/PROMPT_GENERATION.md) — Structure for exporting actionable prompts to AI coding agents
- [TYPOGRAPHY.md](./docs/TYPOGRAPHY.md) — Font family, size, and weight audit strategy
- [UI_UX.md](./docs/UI_UX.md) — Detailed UI specs for popup screens, inspector overlay, and design tokens
- [ROADMAP.md](./docs/ROADMAP.md) — Version milestones from v0.1 to v1.0
- [TESTING.md](./docs/TESTING.md) — Unit, integration, and manual calibration strategies
- [PRIVACY.md](./docs/PRIVACY.md) — Local-first, zero-telemetry guarantee
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) — Contribution guidelines and rule submission standards
- [ATTRIBUTION.md](./docs/ATTRIBUTION.md) — Attribution and licensing

---

## Core Flow

```text
Webpage (DOM + CSSOM)
         │
         ▼
Content Script Scanner (Normalized Element & Section Snapshots)
         │
         ▼
Rule Engine (Evidence-Backed Issues & Confidence Multipliers)
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
Visual Inspector   Audit Stream   AI Fix Plan Generator
(In-Page Overlay)   (Popup UI)     (Cursor / Claude Code)
```

---

## License & Attribution

SlopScan is an independent open-source project. Certain conceptual design audit rules are inspired by [Unslop](https://github.com/heydamir/unslop) under Creative Commons Attribution 4.0 International (CC BY 4.0). See [`docs/ATTRIBUTION.md`](./docs/ATTRIBUTION.md) for details.

