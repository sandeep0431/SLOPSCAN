# Prompt Generation

## Goal

Generate a prompt that can be pasted into:

- Cursor
- Claude Code
- Codex
- Other AI coding agents

---

# Input

Structured scan results.

---

# Prompt Structure

## 1. Role

```text
Act as an expert frontend engineer and UI designer.
```

## 2. Constraints

```text
Preserve:

- Existing functionality
- Product purpose
- Real content
- Existing navigation where appropriate

Do not:

- Invent features
- Add fake testimonials
- Add fake metrics
- Completely redesign unrelated areas
```

## 3. Audit Findings

Group by:

- Priority
- Section
- Category

---

# Example

```text
## HERO

HIGH CONFIDENCE

### Excessive Colored Glow

Evidence:
The primary CTA uses a saturated purple box shadow.

Fix:
Remove the decorative glow. Create emphasis through
contrast and hierarchy.

---

## FEATURES

MEDIUM PRIORITY

### Decorative Emoji

Evidence:
Five feature labels begin with decorative emoji.

Fix:
Remove decorative emoji or replace meaningful symbols
with a consistent icon system.
```

---

# Fix Order

Use:

1. Spacing
2. Color and surfaces
3. Icons
4. Copy
5. Typography
6. Components
7. Layout
8. Details
9. Motion

---

# Final Prompt Requirement

The generated prompt must be:

- Specific
- Evidence-based
- Non-destructive
- Section-aware
- Actionable

Never generate vague advice such as:

> Make the UI more modern.

