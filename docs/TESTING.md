# SlopScan Testing Strategy

## Test Categories

### Unit Tests

Test:

- Gradient detection
- Emoji detection
- Font counting
- Radius detection
- Spacing normalization
- Copy keyword detection

---

## Integration Tests

Test:

```text
DOM
↓
Scanner
↓
Rule Engine
↓
Issue Output
```

---

## Manual Testing Sites

Test different categories:

- SaaS
- Dashboard
- Portfolio
- Blog
- E-commerce
- Documentation

---

# False Positive Tracking

Every problematic detection should be recorded:

```text
Rule ID:
Website Type:
Expected:
Actual:
False Positive:
Notes:
```

---

# Acceptance Criteria

Before adding a rule to production:

- It detects the intended pattern
- It does not crash on unusual DOM
- It provides evidence
- It provides a useful recommendation
- False positives are acceptable

Accuracy is more important than rule count.

