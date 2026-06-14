# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This is a **personal learning knowledge base** for the user to study LLM research at a graduate level. It is a content/writing repository, not a software project — there is no build, test, or lint pipeline.

The user's goal is to internalize the concepts catalogued in `plan.md` by reading **parable-style stories** that illustrate each concept. Future work in this repo will primarily be:

1. Creating/orchestrating agents that generate these parables.
2. Storing the generated parables alongside the concepts they teach.

## The parable-method prompt (canonical)

Any story-generating agent in this repo must follow this exact recipe. Do not paraphrase or shortcut the steps — the user has chosen each one deliberately.

> 1. The user supplies a domain (or leaves it blank to be surprised).
> 2. Choose a **graduate-level**, non-obvious, genuinely deep concept from that domain.
> 3. **Before writing anything**, do a web search to ground the concept in reputable sources (academic papers, encyclopedias, university sites). This step is mandatory — do not write from prior knowledge alone.
> 4. Write a parable in **Chinese (Mandarin)** with human or relatable characters that *indirectly* illustrates the concept. Do **not** name or hint at the concept until the very end — the payoff must land naturally.
> 5. After the story, write a **formal English explanation**: the concept's name, its field, key mechanisms, and why it matters — grounded in the search results.

When building an agent for this task, the agent must have web search available and must be told to follow the steps in order (search → story → explanation), not in parallel.

## Source-of-truth: `plan.md`

`plan.md` is the curriculum **and the work queue**. It groups LLM research into **12 concept clusters**, each with named concepts and seminal papers. Every concept row carries a stable `ID`, a priority label on its cluster header (P0–P3), and a `状态` field (`pending` / `in_progress` / `review` / `done`) that acts as a concurrency lock. Read the "多 Agent 工作流" section of `plan.md` for the full schema before touching it.

When picking a concept for a parable:

- Treat the table rows in `plan.md` as the candidate pool, filtered to `状态: pending`.
- Default ordering: 推荐的阅读路径 first, then P0 → P1 → P2 → P3.
- Only the orchestrator writes to `plan.md` state. Subagents must never edit it.

## Multi-agent generation system

The repo ships three pieces under `.claude/`:

- **`.claude/agents/story-generator.md`** — runs the full pipeline for one concept: web search → Chinese parable → English explanation → save to `stories/<cluster>/<concept-id>.md`. Uses Opus. Owns no state outside its file.
- **`.claude/agents/story-reviewer.md`** — validates one finished file: no concept-name leak in the Chinese body, citations are real (verified by `WebFetch`), the parable structurally maps to the explanation. Uses Sonnet. Flips `status: review` → `done` or `in_progress`.
- **`.claude/commands/generate-stories.md`** — invoked as `/generate-stories [N]` (default 3). The main session takes the orchestrator role: claims N concepts in `plan.md`, dispatches N `story-generator` agents **in a single message** (parallel), then N `story-reviewer` agents the same way, then resolves verdicts.

Key invariant: parallel dispatch must be one message with N `Agent` tool calls — never serialized. Generators are fully independent (one concept each) so they don't need to coordinate.

When the user asks "write some stories" or "generate the next batch," default to running `/generate-stories`.

## Language conventions

- Stories: **Chinese (Mandarin)**. The concept name must not appear in the story body — only in the post-story English explanation.
- Explanations: **English**, formal register, grounded in cited sources from the web search.
- This split is intentional (the user is bilingual and uses the language switch as a cognitive cue between narrative and analysis). Do not collapse them into one language.

## What does NOT belong here

- Build/test/lint scaffolding — this is not a code project.
- Generic "LLM tutorial" content. The whole point of the parable method is indirection; straightforward explanations exist everywhere already.
- Concept summaries written without a prior web search. Skipping the search defeats the user's learning goal (accuracy + freshness).
