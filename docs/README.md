# SlopScan

## Automated UI Craft Audit for Live Websites

SlopScan is a Chrome extension that scans the currently open website and identifies measurable signs of generic, over-decorated, inconsistent, or "vibe-coded" interface design.

Instead of simply giving a website a percentage score, SlopScan provides:

- Visual evidence
- Exact element locations
- Confidence levels
- Section-by-section analysis
- Actionable recommendations
- Typography suggestions
- A structured prompt for AI coding agents

---

## What SlopScan Does

SlopScan analyzes:

### Visual surfaces
- Excessive gradients
- Gradient text
- Colored glows
- Decorative blurred blobs
- Glassmorphism overuse
- Accent color overuse

### Spacing
- Inconsistent spacing
- Arbitrary spacing values
- Uneven card padding
- Weak grouping hierarchy
- Misaligned repeated elements

### Typography
- Too many font families
- Too many font sizes
- Too many font weights
- Overly heavy headings
- Excessive uppercase labels
- Tracking inconsistencies

### Icons
- Decorative emoji
- Inconsistent icon sizing
- Inconsistent icon alignment
- Decorative sparkle icons

### Copy
- Generic hype language
- Excessive exclamation marks
- Generic greetings
- Placeholder content
- Generic AI marketing language

### Components
- Excessive pills
- Inconsistent border radius
- Excessive badges
- Glowing components
- Over-decorated cards

### Layout
- Weak hierarchy
- Too many hero actions
- Template-like compositions
- Repetitive card layouts
- Excessive decorative elements

### Motion
- Infinite decorative animations
- Distracting motion
- Layout-property animations

---

## Core Philosophy

SlopScan does not claim that every detected pattern is bad.

Instead, every finding has:

- Severity
- Confidence
- Evidence
- Location
- Recommendation

Example:

> HIGH CONFIDENCE  
> Colored glow detected on the primary CTA button.

This is different from:

> ❌ Your website is bad.

SlopScan helps developers inspect their UI and decide what should be improved.

---

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3
- DOM APIs
- CSSOM
- Custom rule engine

---

## Privacy

The core scanner runs locally inside the browser.

By default:

- No website data is uploaded
- No backend is required
- No API key is required
- No screenshots leave the browser

---

## Project Flow

Website
↓
DOM + CSS Scanner
↓
Normalized Scan Data
↓
Rule Engine
↓
Issues + Evidence
↓
Visual Inspector
↓
Recommendations
↓
Fix Prompt Generator

---

## Status

🚧 Active Development

See:

- `BUILD.md` for implementation
- `RULES.md` for detection rules
- `DESIGN.md` for the visual system
- `ARCHITECTURE.md` for technical architecture

