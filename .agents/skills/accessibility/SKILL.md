---
name: accessibility
description: Use when writing or reviewing UI markup, interactive components, dialogs, menus, or forms during a clone — enforces matching only the accessibility behavior actually present on the reference site, not adding extra behavior.
---

# Accessibility (Clone-Matched Only)

## Principle
Replicate the reference site's actual accessibility behavior — no more, no less. Do not add ARIA, keyboard support, focus management, or motion preferences the reference doesn't demonstrably have. This skill is about fidelity, not about improving on the source.

## Process
Before implementing an interactive component (dialog, menu, dropdown, carousel, form), check the reference for:
- Does it respond to keyboard input (Tab, Enter, Escape, Arrow keys)? If yes, replicate exactly which keys do what. If the reference doesn't support a key, don't add it.
- Does focus move/trap when the component opens (e.g. a modal)? Replicate that exact behavior — no more, no less.
- What semantic elements / ARIA roles and attributes does the reference's markup actually use? Match them, don't upgrade beyond them.
- Does the reference provide alt text on images? Match what's present (including if it's missing or empty).
- Does the reference honor `prefers-reduced-motion`? Only implement this if the reference actually does.

## Rules
- Do not silently add accessibility features "because it's best practice" — if it's not observably present on the reference, leave it out.
- If a genuine accessibility gap in the reference is found, note it in the review output rather than fixing it unprompted — implementation should match, not editorialize.
- If the reference's behavior can't be determined (e.g. can't inspect a third-party site closely enough), default to the closest semantic HTML equivalent rather than guessing at ARIA.
