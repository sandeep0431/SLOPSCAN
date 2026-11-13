# SlopScan Rule System

## Rule Philosophy

A detected pattern is not automatically bad.

SlopScan uses three confidence levels:

### High Confidence

A measurable pattern strongly matches a rule.

Example:

- Gradient text
- Decorative emoji
- Infinite animation
- Large colored glow

### Medium Confidence

The pattern may be problematic depending on context.

Example:

- Many font sizes
- Many colors
- Repeated cards

### Review Suggested

The scanner can detect the pattern but cannot reliably judge whether it is intentional.

Example:

- Centered hero
- Generic composition
- Large empty space

---

# Severity

## High

Strongly affects clarity, hierarchy, accessibility, or visual quality.

## Medium

Likely contributes to inconsistency or generic design.

## Low

A potential refinement.

---

# 1. Surface Rules

## R001 — Hue Gradient

Detect:

- linear-gradient
- radial-gradient
- conic-gradient

Flag when:

- Multiple distinct hues are present
- Decorative gradients appear repeatedly
- Large UI surfaces use them without clear semantic purpose

Recommendation:

> Prefer quiet surfaces. Reserve accent color for meaningful emphasis.

---

## R002 — Gradient Text

Detect:

```css
background-clip: text
-webkit-background-clip: text
```

combined with a gradient background.

Recommendation:

> Use a solid text color unless the gradient is part of an intentional brand identity.

---

## R003 — Colored Glow

Detect:

- Saturated box-shadow
- Large blur radius
- Saturated drop-shadow
- Saturated text-shadow

Recommendation:

> Remove decorative glows and create hierarchy through contrast, spacing, and scale.

---

## R004 — Decorative Blurred Blob

Detect:

- Large blurred elements
- Absolute/fixed positioning
- Saturated background
- Decorative placement behind content

Recommendation:

> Remove decorative background blobs unless they serve a product-specific visual purpose.

---

## R005 — Excessive Accent Usage

Measure:

- Accent-colored elements
- Total prominent elements

Flag when the same accent is used across too many unrelated elements.

Recommendation:

> Use accent color as a scarce visual resource.

---

# 2. Spacing Rules

## R010 — Off-Scale Spacing

Collect:

- Padding
- Margin
- Gap

Look for recurring values.

Recommended rhythm:

```text
4
8
12
16
20
24
32
40
48
64
```

Do not automatically flag every unusual value.

Allow exceptions for:

- Border alignment
- Icon optical alignment
- Responsive calculations

---

## R011 — Arbitrary Spacing

Flag repeated unusual values:

```text
7px
13px
19px
31px
```

when they do not form a consistent scale.

---

## R012 — Inconsistent Card Padding

Compare sibling cards with similar:

- Role
- Dimensions
- Layout

Flag significantly different padding.

---

## R013 — Weak Grouping Hierarchy

Measure:

- Gap inside related groups
- Gap between unrelated groups

Potential issue:

```text
Inside group: 32px
Between groups: 12px
```

Recommendation:

> Related items should generally be visually closer than unrelated groups.

---

# 3. Typography Rules

## R020 — Too Many Font Families

Count distinct visible font families.

Suggested warning:

- 1–2: normal
- 3: review
- 4+: likely inconsistent

Do not flag:

- Icon fonts
- Code blocks
- Intentional editorial combinations

---

## R021 — Too Many Font Sizes

Group sizes by text role.

Do not simply count every computed size.

Consider:

- Headings
- Body
- Labels
- Metadata
- Buttons

---

## R022 — Excessive Font Weights

Flag when too many weights are used for ordinary UI hierarchy.

Recommended principle:

> Use size and spacing before adding excessive weight variation.

---

## R023 — Heavy Heading Overuse

Review repeated:

```text
700
800
900
```

especially when most headings use the same extreme weight.

---

## R024 — Uppercase Tracked Labels

Detect:

- Mostly uppercase text
- Short label
- Positive letter spacing

Recommendation:

> Prefer sentence case unless uppercase communicates a deliberate system or category.

---

# 4. Icon Rules

## R030 — Decorative Emoji

Detect emoji inside:

- Navigation
- Buttons
- Labels
- Feature cards
- Headings

Do not automatically flag emoji in:

- User-generated content
- Chat messages
- Social content

---

## R031 — Inconsistent Icon Size

Compare icons within equivalent interface groups.

---

## R032 — Decorative Sparkles

Detect:

- ✨
- sparkle icons
- repeated decorative stars

Flag only when used as visual decoration rather than meaning.

---

# 5. Copy Rules

## R040 — Excessive Exclamation

Detect:

```text
!
!!
!!!
```

Recommendation:

> Prefer clear statements over excitement punctuation.

---

## R041 — Generic Hype Language

Initial dictionary:

```text
revolutionary
game-changing
seamless
powerful
unlock
supercharge
transform
magic
effortlessly
next-level
cutting-edge
world-class
```

This is a suggestion rule, not an absolute error.

---

## R042 — Generic Greeting Headline

Examples:

```text
Welcome back
Hello!
Hey there!
```

Recommendation:

> Use the actual page context as the title.

---

## R043 — Placeholder Content

Detect:

```text
Lorem ipsum
[Company Name]
[Your Name]
TODO
Coming Soon
```

depending on production context.

---

## R044 — Generic AI Copy

Examples:

```text
Powered by AI
AI-powered everything
Unlock the power of AI
Transform with AI
```

Flag repeated or vague usage.

Recommendation:

> Explain what the AI capability actually does.

---

# 6. Component Rules

## R050 — Everything Is a Pill

Measure border radius relative to element height.

Example:

```text
height: 40px
border-radius: 9999px
```

If many unrelated components are pills:

Flag.

---

## R051 — Inconsistent Radius System

Collect common radius values.

Example of healthy system:

```text
4px
8px
12px
```

Example of chaotic system:

```text
3px
7px
11px
15px
19px
27px
```

---

## R052 — Excessive Badges

Detect repeated:

```text
NEW
PRO
BETA
HOT
TRENDING
```

Only flag decorative overuse.

---

## R053 — Glowing Component

Detect colored shadow around:

- Buttons
- Cards
- Pills
- Inputs

---

# 7. Layout Rules

## R060 — Too Many Hero Actions

Detect three or more prominent hero actions.

Recommendation:

> Prefer one primary action and one secondary action.

---

## R061 — Repetitive Equal Card Grid

Detect many cards with:

- Equal width
- Equal height
- Same padding
- Same visual structure

This is review-only.

---

## R062 — Weak Visual Hierarchy

Compare relative size and position of major content blocks.

Flag only as a review suggestion.

---

## R063 — Decorative Background Elements

Detect:

- Orbs
- Grids
- Lines
- Blobs
- Decorative absolute layers

Flag when they compete with content.

---

# 8. Motion Rules

## R070 — Infinite Decorative Animation

Detect:

```css
animation-iteration-count: infinite
```

Review purpose.

High confidence when the animated element is:

- Decorative
- Non-interactive
- Background-only

---

## R071 — Layout Animation

Detect transitions or animations on:

```text
width
height
top
left
right
bottom
```

Recommendation:

> Prefer transform and opacity where appropriate.

---

## R072 — Excessive Motion

Count simultaneously animated decorative elements.

Flag when multiple elements continuously compete for attention.

---

# Rule Output Format

Every issue must contain:

```ts
{
  id: "issue-123",

  ruleId: "R003",

  category: "surfaces",

  title: "Colored glow",

  severity: "high",

  confidence: "high",

  section: "Hero",

  evidence:
    "Primary CTA has a saturated purple box-shadow with 40px blur.",

  recommendation:
    "Remove the colored glow and use contrast or hierarchy instead.",

  selector: ".hero .primary-button"
}
```

---

# Critical Rule

Never report:

> This design is objectively bad.

Instead report:

> This measurable pattern was detected and may contribute to visual inconsistency.

The extension is an inspection tool, not an absolute design judge.

