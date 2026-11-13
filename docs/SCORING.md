# SlopScan Scoring System

## Important Principle

The score is a summary signal.

It is NOT:

> An objective measure of whether a design is good.

---

# Categories

- Surfaces
- Spacing
- Typography
- Icons
- Copy
- Components
- Layout
- Motion

---

# Weighted Issues

Example:

```text
High confidence + high severity
= strong impact

Medium confidence + medium severity
= moderate impact

Review suggestion
= minimal or no score penalty
```

---

# Suggested Weight

```text
High severity:    8 points
Medium severity:  4 points
Low severity:     2 points
```

Confidence multiplier:

```text
High:    1.0
Medium:  0.7
Review:  0.3
```

Example:

```text
Medium severity + Review

4 × 0.3 = 1.2 impact
```

---

# Score Protection

Do not penalize the same repeated pattern infinitely.

Example:

20 identical cards with the same glow should not create:

```text
20 × -8
```

Instead:

- Detect pattern cluster
- Report affected count
- Apply capped penalty

---

# Output

Use:

```text
Audit Signal: 72
```

Plus:

```text
High Priority: 4
Improve: 11
Review: 6
```

The issue list is always more important than the score.

