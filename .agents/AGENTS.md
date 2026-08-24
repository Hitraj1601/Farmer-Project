# Workspace Subagent Execution & Orchestration Rules

This document governs the multi-subagent UI development workflow inside this workspace (paths are relative to the repo root, e.g. `airbnb-clone/`).

> **Platform note**: Tool names below (`view_file`, `run_command`, etc.) assume an agent runtime that exposes these primitives. If running in a different environment, map each to your platform's equivalent (file read, terminal exec, web fetch, grep/search) — the *permission boundaries* (read-only vs. write/terminal vs. isolated) are what matter, not the literal tool names.

## Subagent Definitions & Tool Access

### 1. `ui-analyst` (Read-Only)
- **Role**: Visual and structure analyzer.
- **Allowed Tools**: Read-only tools (`view_file`, `read_url_content`, `browser_subagent`, `grep_search`, `list_dir`).
- **Inputs**: Reference screenshot/image file OR live web URL link (or both).
- **Skill References**: Cross-references [ui-clone](../skills/ui-clone/SKILL.md) for measurement fidelity, and [accessibility](../skills/accessibility/SKILL.md) & [animation](../skills/animation/SKILL.md) for capturing observed baseline state.
- **URL Failure Fallback Rule**: If live URL is blocked or inaccessible, explicitly state `"Could not access live URL [url]: [reason]; falling back to screenshot analysis only"`. Never infer or hallucinate unobserved details.
- **Deliverables**: Component Hierarchy, Design Token List, Interactive/Motion/A11y State Notes, **Responsive Breakpoint Notes** (layout/spacing/typography changes observed at mobile, tablet, and desktop widths — capture actual breakpoints from the reference, don't assume standard ones).
- **Rule**: STRICTLY NO CODE GENERATION. Output analysis markdown only.

### 2. `implementer` (Write & Terminal Access)
- **Role**: Frontend Developer.
- **Allowed Tools**: Write & Terminal tools (`write_to_file`, `replace_file_content`, `multi_replace_file_content`, `run_command`).
- **Stack**: React + Vite + Tailwind CSS + Node.js (with Lucide icons / Framer Motion).
- **Skill References**: Cross-references [react-best-practices](../skills/react-best-practices/SKILL.md), [ui-clone](../skills/ui-clone/SKILL.md), [animation](../skills/animation/SKILL.md), and [accessibility](../skills/accessibility/SKILL.md).
- **Architecture**: Small, single-responsibility files using feature-based architecture (`src/features/<feature>/`, `src/components/ui/`).
- **Rules**:
  - No monolithic files.
  - Honor `prefers-reduced-motion` for all transitions.
  - Apply review fixes ONLY after human user approval of the consolidated review findings.
  - **Verification gate**: Before handing off to review, run the build (`npm run build`), lint, and typecheck (if applicable) via `run_command`. Do not hand off to reviewers on a failing build — fix build/lint errors first and report what was fixed.

### 3. `a11y-reviewer` (Isolated Read-Only)
- **Role**: Accessibility Auditor.
- **Allowed Tools**: Read-only inspection tools (`view_file`, `grep_search`).
- **Skill References**: Cross-references [accessibility](../skills/accessibility/SKILL.md) and [review](../skills/review/SKILL.md).
- **Scope**: Isolated read-only access to final codebase.
- **Checks**: Semantic HTML, ARIA correctness, keyboard nav, focus management, color contrast, alt text.
- **Deliverables**: Bulleted findings anchored with exact `[file:line]` references.

### 4. `code-reviewer` (Isolated Read-Only)
- **Role**: Code Quality Auditor.
- **Allowed Tools**: Read-only inspection tools (`view_file`, `grep_search`).
- **Skill References**: Cross-references [react-best-practices](../skills/react-best-practices/SKILL.md) and [review](../skills/review/SKILL.md).
- **Scope**: Isolated read-only access to final codebase.
- **Checks**: Readability, naming consistency, duplicate logic, dead code, re-render performance, prop/type safety.
- **Deliverables**: Bulleted findings anchored with exact `[file:line]` references.

---

## Cross-Reviewer Conflict Rule

If `a11y-reviewer` and `code-reviewer` findings conflict (e.g. one wants added markup/attributes, the other wants a leaner DOM), the orchestrator does **not** silently pick a side. Both findings are surfaced together in the consolidated plan, flagged as conflicting, with a one-line tradeoff summary. The human user decides which takes priority.

## Human Approval Definition

"Approval" requires an explicit affirmative reply to the consolidated findings (e.g. "yes", "approved", "go ahead") — silence or an ambiguous reply does not count as approval.
- **Full approval**: `implementer` applies all listed fixes.
- **Partial approval**: user selects a subset (by item or severity, e.g. "just the Critical/High ones"); `implementer` applies only the approved subset and the rest remain logged as open findings in the final summary.

## Workflow Sequence

1. **Analysis Phase**: Run `ui-analyst` on provided image/URL. If URL fetch fails, output failure notice and fall back to image analysis.
2. **Implementation Phase**: Run `implementer` with analyst output & tech stack. Build modular component tree. Verify build/lint/typecheck pass before proceeding.
3. **Parallel Review Phase**: Spawn `a11y-reviewer` and `code-reviewer` in parallel over finished code.
4. **Human Approval Phase**: Main orchestrator consolidates review findings (flagging any conflicts per the rule above) into a clear plan and requests user approval per the definition above.
5. **Fix Phase**: Upon approval, run `implementer` to apply the approved fixes directly to code, then re-run the build/lint/typecheck gate.
6. **Re-Review Phase**: Re-run only the reviewer(s) whose findings were addressed, scoped to the changed files, to confirm each approved finding is actually resolved.
   - **Loop limit**: Maximum 2 fix→re-review cycles. If findings remain unresolved after 2 cycles, stop and present the outstanding items to the user as a decision point rather than continuing to iterate automatically.
7. **Summary Phase**: Present final summary of changes, rationale, and any open/deferred findings to the user.