---
description: Generate N parable-style stories in parallel for the next pending concepts in plan.md
argument-hint: [count]
---

You are now acting as the **orchestrator** for the multi-agent story generation system defined in `plan.md` and `CLAUDE.md`.

Argument: `$1` is the number of concepts to generate. If empty, default to **3**.

## Sequence

### Phase 1 — Pick concepts

1. Read `plan.md`.
2. Pick `$1` concepts using this priority order:
   1. Any concept that appears in 推荐的阅读路径 (the four-stage reading path) and is still `pending` — pick in stage order, then left-to-right within a stage.
   2. Then fall back to cluster priority labels: P0 → P1 → P2 → P3.
   3. Within the same priority tier, lower-numbered cluster first, then top-to-bottom within the cluster table.
3. If fewer than `$1` concepts are `pending`, pick what's available and tell the user how many will run.

### Phase 2 — Claim them (concurrency lock)

Before dispatching, edit `plan.md` to flip the `状态` of every picked concept from `pending` → `in_progress`. Do this in one batch so claims are visible atomically. **Only the orchestrator writes `plan.md`** — subagents must not.

### Phase 3 — Dispatch generators in parallel

Send a **single message** containing one `Agent` tool call per concept, each invoking the `story-generator` subagent. Each prompt must include:

- `concept_id`
- `concept_name` (the bolded name)
- `cluster_id`
- `briefing` (the 简介 cell)

Do not chain them sequentially. The whole point of the parallel dispatch is that all generators run concurrently.

### Phase 4 — Mark for review

When all generators return, edit `plan.md` to flip each concept `in_progress` → `review`. Collect the file paths from each generator's return value.

### Phase 5 — Dispatch reviewers in parallel

Send another single message with one `Agent` call per file, invoking `story-reviewer`. Pass `file_path`. Run them concurrently — reviewers are independent.

### Phase 6 — Resolve verdicts

For each reviewer return:

- `passed` → edit `plan.md` to flip that concept `review` → `done`.
- Failure list → leave `plan.md` at `in_progress` and surface the issues to the user, grouped by `concept_id`. Do not auto-retry — the user decides whether to regenerate or hand-edit.

### Phase 7 — Report

Reply with a short summary:

- N concepts attempted
- list of `done` concepts and their file paths
- list of `in_progress` concepts with one-line reasons (from reviewer)

## Hard rules

- Never let a subagent write to `plan.md`. State transitions are your job alone.
- Always batch parallel `Agent` calls into a single message — don't serialize them.
- If you crash partway through, on retry: any concept stuck at `in_progress` with no story file is unclaimed; revert it to `pending` before re-dispatching.
- Do not generate stories yourself. Your role is dispatch + state, not authorship.
