---
name: react-best-practices
description: Use when writing or structuring React components — enforces component size limits, composition patterns, folder structure, and prop discipline.
---

# React Best Practices

## Never
- Write gigantic components that handle layout, state, data-fetching, and multiple unrelated UI concerns at once — split by responsibility.
- Duplicate JSX across components — extract a shared component instead of copy-pasting a block with minor tweaks.
- Duplicate Tailwind class strings across multiple components — extract to a shared component, a `cva`/class-variance pattern, or a constant.

## Always
- Organize by feature folders (`features/<feature>/components`, `features/<feature>/hooks`) rather than dumping everything into one flat `components/` directory.
- Prefer composition over configuration — build complex UI from small components passed as `children`/props rather than one component with many conditional flags.
- Extract repeated stateful logic into reusable hooks (`useDisclosure`, `useDebouncedValue`, etc.) instead of re-implementing it per component.
- Type props explicitly (TypeScript interface/type, or PropTypes if the project is JS-only) — no implicit `any`, no untyped destructuring of unknown shape.
- Keep each component to a single responsibility — if a component needs a comment explaining its multiple jobs, split it.
