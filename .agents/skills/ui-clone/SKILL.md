---
name: ui-clone
description: Use when recreating a UI from a reference image, screenshot, or live site with pixel-perfect fidelity — matching spacing, typography, layout, and design tokens.
---

# UI Clone

## Goal
Recreate the reference UI with pixel-perfect fidelity. Behavior and appearance are reproduced; source code is never copied.

## Rules
- Never approximate spacing — measure proportions from the reference (padding, margin, gap) rather than guessing round numbers.
- Reuse design tokens. If a spacing, color, radius, or font-size value already exists as a token, use the token — never hardcode a raw value that duplicates one.
- Measure proportions before implementing: relative sizing between elements matters as much as absolute pixel values.
- Match typography exactly — font family, size, weight, and line-height, not an approximation.
- Use semantic HTML (`nav`, `main`, `section`, `article`, `button`, `header`, `footer`) — never a `div` where a semantic element fits.
- No unnecessary wrapper elements. Every extra `div` should justify itself (layout, styling hook, or accessibility) or be removed.
