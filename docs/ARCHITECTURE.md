# SlopScan Architecture

## High-Level Architecture

```text
┌─────────────────────────┐
│ Popup Application       │
│ React + TypeScript      │
└────────────┬────────────┘
             │
             │ Chrome Messages
             ▼
┌─────────────────────────┐
│ Content Script          │
│                         │
│ DOM Collection          │
│ CSS Collection          │
│ Section Detection       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Analysis Engine         │
│                         │
│ Normalize Data          │
│ Execute Rules           │
│ Group Issues            │
│ Score Categories        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Results                 │
│                         │
│ Findings                │
│ Typography              │
│ Fix Plan                │
└─────────────────────────┘
```

---

# Extension Components

## Popup

Responsible for:

- UI
- Results
- User actions

Must NOT contain webpage scanning logic.

---

## Content Script

Responsible for:

- Reading DOM
- Reading computed styles
- Finding visible elements
- Highlighting elements

---

## Background Service Worker

Responsible for:

- Message coordination
- Tab lifecycle
- Persistent extension tasks

---

## Shared Engine

Responsible for:

- Rules
- Scoring
- Prompt generation
- Normalization

The rule engine should be independent from React.

This makes future testing easier.

