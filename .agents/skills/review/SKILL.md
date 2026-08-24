---
name: review
description: Use when reviewing code, accessibility, or UI fidelity and reporting findings — enforces a structured, actionable output format instead of generic commentary.
---

# Review Output Format

Every review finding must be reported using this exact structure — no generic or vague commentary. What to look *for* is defined by the reviewing agent's own task (e.g. accessibility, code quality); this skill governs only how findings are *reported*.

## Required fields per finding
- **Severity**: Critical / High / Medium / Low
- **File**: exact file path
- **Line**: exact line number (or range)
- **Issue**: one specific, concrete problem — not "could be improved"
- **Suggested fix**: a specific, actionable change, not "consider refactoring"

## Rules
- One finding per issue — don't bundle unrelated problems into a single entry.
- No generic comments ("code could be cleaner," "consider accessibility improvements") — every finding must be specific enough that someone could act on it without asking a follow-up question.
- If no issues are found in a category, state that explicitly rather than omitting the section.
- Order findings by severity, highest first.
