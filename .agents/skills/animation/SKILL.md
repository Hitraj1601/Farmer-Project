---
name: animation
description: Use when implementing hover effects, transitions, or any motion in the UI during a clone — enforces matching only the animation behavior, timing, and easing actually observed on the reference site.
---

# Animation (Clone-Matched Only)

## Principle
Replicate the reference site's actual motion — no more, no less. Don't add animations, transitions, or hover effects the reference doesn't have, and don't skip ones it does have.

## Process
For each interactive element, observe the reference and match:
- Does it animate on hover/focus/click at all? If the reference has no transition, implement none.
- What property changes (scale, opacity, color, position)? Replicate the same property, not a substitute.
- What's the observed duration? Match it as closely as possible rather than defaulting to a round number.
- What's the observed easing curve (linear, ease-out, spring-like, etc.)? Match the feel, not just "ease-in-out" by default.
- Does the reference respect `prefers-reduced-motion`? Only implement that behavior if the reference actually does it.

## Rules
- Implement matched animations using `transform`/`opacity` where possible for smoothness — but the choice of *whether* something animates and *how* comes from the reference, not from general animation best practice.
- Don't invent transitions on elements that are static on the reference, even if it "would look nice."
- If exact timing/easing can't be measured precisely, get as close as observation allows rather than guessing a stock value.
