# SlopScan Design System

## Design Goal

SlopScan must feel like:

> A professional visual inspection instrument for websites.

It must NOT feel like:

- A generic Chrome extension
- An AI chatbot wrapper
- A dashboard with random cards
- A single giant percentage
- A colorful SaaS landing page
- A purple-gradient "AI tool"

---

# Core Design Principle

## Evidence > Score

The most important thing is not:

```text
68/100
```

The most important thing is:

```text
WHAT was found
WHERE it was found
WHY it was flagged
HOW to fix it
```

The score is secondary.

---

# Visual Personality

SlopScan should feel:

- Technical
- Precise
- Editorial
- Calm
- Slightly forensic
- High quality
- Tool-like

Keywords:

```text
Inspector
Audit
Evidence
Signal
Finding
Trace
Surface
System
```

Avoid:

```text
Magic
AI glow
Sparkles
Futuristic blobs
Neon gradients
Generic SaaS cards
```

---

# Layout Concept

Do NOT use:

```text
┌────────────────────┐
│                    │
│       68%          │
│   YOUR SCORE       │
│                    │
└────────────────────┘
```

Instead:

```text
┌──────────────────────────────────────┐
│ SLOPSCAN                     ● LIVE  │
│ example.com                          │
├──────────────────────────────────────┤
│                                      │
│  AUDIT SUMMARY                       │
│                                      │
│  04  High priority findings          │
│  11  Improvements                    │
│  06  Review suggestions              │
│                                      │
├──────────────────────────────────────┤
│ PRIORITY FINDINGS                    │
│                                      │
│ ▌ Excessive colored glow             │
│   Hero → Primary CTA                 │
│   [ Inspect ]                        │
│                                      │
│ ▌ Decorative emoji                   │
│   Features → Card labels             │
│   [ Inspect ]                        │
│                                      │
├──────────────────────────────────────┤
│ [ Generate Fix Plan ]                │
└──────────────────────────────────────┘
```

---

# Primary Navigation

Use three modes:

```text
AUDIT
TYPE
FIX PLAN
```

## AUDIT

Shows:

- Findings
- Evidence
- Locations

## TYPE

Shows:

- Font system
- Font families
- Scale
- Weight system
- Suggested directions

## FIX PLAN

Shows:

- Prioritized changes
- Generated prompt
- Copy button

---

# Main Screen Structure

## Header

```text
SLOPSCAN

example.com
Last scanned just now
```

Avoid large logos.

Keep branding compact.

---

# Summary Strip

Use factual counts:

```text
04 HIGH
11 FIXES
06 REVIEW
```

Not:

```text
YOUR DESIGN IS 68% GOOD
```

Counts are more useful than a vague score.

---

# Priority Findings

This is the main visual focus.

Each finding should look like an inspection record:

```text
HIGH PRIORITY

Colored Glow

Hero / Primary CTA

Evidence:
Saturated purple shadow with 48px blur.

Recommendation:
Remove the glow and use contrast for hierarchy.

[ Inspect Element ]
```

---

# Finding Anatomy

Every finding contains:

```text
STATUS
TITLE
LOCATION
EVIDENCE
RECOMMENDATION
ACTION
```

Example:

```text
HIGH CONFIDENCE

Gradient Text

Hero → Main Heading

Evidence
The heading uses a multi-hue background clipped to text.

Recommendation
Use a solid text color and reserve accent color
for meaningful emphasis.

[ Inspect ]
```

---

# Visual Hierarchy

Priority:

1. Findings
2. Evidence
3. Actions
4. Recommendations
5. Statistics
6. Score

Never make the score the biggest element.

---

# Color System

## Base

Use quiet neutral surfaces.

Example conceptual tokens:

```text
Canvas
Surface
Raised Surface
Border
Primary Text
Secondary Text
Muted Text
```

## Accent

Use ONE primary accent.

The accent should be used for:

- Active tab
- Primary action
- Selection
- Focus

Do not use it everywhere.

---

# Status Colors

Use status colors sparingly.

```text
High Priority
Medium Priority
Review
```

The color should support the label, not replace it.

Never rely only on color.

---

# Typography

Recommended visual direction:

## Interface

Use a highly readable sans-serif.

Examples:

- Inter
- IBM Plex Sans
- Manrope

## Metadata

Optionally use a mono face for:

- Selectors
- CSS values
- Technical evidence

Examples:

- IBM Plex Mono
- JetBrains Mono

This creates a distinctive:

> Design tool + inspection instrument

feeling.

---

# Spacing

Use a strict spacing scale.

```text
4
8
12
16
24
32
40
48
```

The extension itself should demonstrate good UI discipline.

SlopScan must not violate the rules it detects.

---

# Border Radius

Use restrained radius.

Example:

```text
Small controls: 6px
Panels: 10px
Large surfaces: 12px
```

Avoid:

```text
9999px everywhere
```

---

# Cards

Do not turn every piece of information into a floating card.

Prefer:

- Dividers
- Grouped sections
- Clear hierarchy
- Quiet surfaces

Cards should exist only when they represent a distinct object.

---

# Empty State

Do not use:

```text
🎉 Amazing!
Your website is perfect!
```

Use:

```text
No high-confidence issues detected.

This does not guarantee the interface is perfect.
Review suggestions may still be available.
```

---

# Score Design

If a score exists, keep it secondary.

Example:

```text
AUDIT SIGNAL
72
Moderate refinement opportunity
```

Do not display:

```text
72%
```

as the main hero.

The score must never be presented as an objective measurement of design quality.

---

# Inspection Mode

When the user clicks:

[ Inspect ]

The webpage should:

1. Scroll to the target
2. Outline the element
3. Display a small annotation
4. Allow the user to close inspection

Example:

```text
┌─────────────────────────────┐
│ HIGH CONFIDENCE             │
│ Colored Glow                │
│                             │
│ Large saturated shadow      │
│ detected.                   │
│                             │
│ Remove decorative glow.     │
└─────────────────────────────┘
```

The overlay should feel precise, not flashy.

---

# Animation

Use minimal animation.

Allowed:

- 150–250ms fades
- Selection transitions
- Inspector movement

Avoid:

- Infinite animations
- Bouncy transitions
- Decorative motion
- Loading spinners when not necessary

---

# The "No Generic AI Tool" Rule

Before approving any UI component ask:

> Could this component appear unchanged in 500 random AI SaaS products?

If yes:

Redesign it.

Avoid:

- Purple gradients
- Glow cards
- Huge rounded rectangles
- Sparkles
- "AI Powered" badges
- Generic analytics circles
- Random decorative blobs

---

# Design Inspiration Direction

The extension should feel closer to:

- Browser DevTools
- A design review instrument
- An editorial audit
- A professional inspection panel

And less like:

- A startup landing page
- A crypto dashboard
- A generic AI wrapper

---

# Final Design Test

The UI is successful if a user can answer within seconds:

1. What did the scanner find?
2. Which issue matters most?
3. Where is it?
4. Why was it detected?
5. What should I do next?

If the UI only communicates:

> Your score is 68

then the design has failed.

