# Posting Pipeline Implementation Plan

**Date:** 2026-03-24

**Status:** implementation plan only

## Goal

Implement the MVP for `solana-diary-poster` as a standalone Railway service that:

- runs scheduled posting slots
- loads existing dataset payloads and rendered assets from Postgres
- generates deterministic draft copy
- routes approval and recovery actions through Telegram
- publishes approved posts to X

This document assumes the runtime code will live in a separate service repository or in a future monorepo expansion. It does not assume the current `HoweCreative` Vite app will host this logic.

## Delivery Strategy

Build the service in slices that preserve operator visibility and reduce the chance of silent posting bugs.

Recommended order:

1. service skeleton, config, and health checks
2. schema migrations
3. DB read models for payload/asset lookup
4. deterministic draft generation
5. Telegram send + webhook loop
6. retry/error flow
7. X publication
8. autopost and blocked-token controls
9. observability and hardening

## Phase 1: Service Skeleton

Create a minimal service with:

- `GET /health`
- protected internal endpoint for slot execution
- Telegram webhook endpoint
- config loader
- database session wiring
- structured logging

Suggested package layout:

```text
solana_diary_poster/
  __init__.py
  __main__.py
  app.py
  config.py
  db.py
  logging.py
  routes/
    health.py
    internal.py
    telegram.py
  services/
    jobs.py
    drafts.py
    assets.py
    approvals.py
    publish_x.py
    telegram_bot.py
  repositories/
    post_jobs.py
    exports.py
    drafts.py
    approvals.py
    publications.py
    settings.py
    blocked_tokens.py
  templates/
    trending_memecoins.py
    single_token.py
  models/
    post_job.py
    blocked_token.py
```

Deliverables:

- app boots locally
- `/health` returns 200
- config validation fails fast for missing required secrets

## Phase 2: Migrations

Add migrations for:

- `post_jobs`
- `blocked_tokens`
- `post_drafts.post_job_id`
- `post_drafts.template_variation`
- `approvals.post_draft_id`
- `approvals.post_job_id`
- `publications.post_draft_id`
- `publications.x_post_url`

Migration requirements:

- add indexes on job status, scheduled time, and token address
- backfill nullable relationships safely
- avoid making old rows invalid during rollout

Validation:

- migration up/down in staging
- no breakage for existing reads on `post_drafts`, `approvals`, `publications`

## Phase 3: Job Creation and Load Path

Implement a job runner that:

1. creates or locks the `post_jobs` row
2. resolves the slot-to-dataset mapping
3. loads the latest export payload
4. loads the rendered asset
5. validates freshness and completeness

On success:

- transition job to `running`

On failure:

- record exact structured error detail
- enqueue retry if under max retry count
- notify Telegram

Important rule:

- all job creation and load operations must be idempotent for the same slot/job key

Recommended repository methods:

- `create_job_if_absent(...)`
- `lock_job(...)`
- `mark_job_running(...)`
- `mark_job_failed(...)`
- `mark_job_awaiting_approval(...)`
- `mark_job_cancelled(...)`

## Phase 4: Deterministic Draft Generation

Implement per-family template modules with explicit variations.

Example interface:

```python
def build_post_text(payload: dict, variation: int) -> str:
    ...
```

Requirements:

- output capped for X
- deterministic for the same payload and variation
- no LLM dependency in MVP
- variation index stored on `post_drafts`

Suggested first families:

- trending memecoins
- single-token post

Validation:

- unit tests with frozen payload fixtures
- length checks
- deterministic output snapshot tests

## Phase 5: Telegram Approval Loop

Implement Telegram integration in two parts:

### Send

- send photo + caption + inline keyboard
- persist `tg_chat_id` and `tg_approval_message_id` on `post_jobs`

### Receive

- parse callback payloads from `POST /telegram/webhook`
- validate bot token/webhook expectations
- route actions to handlers

Supported actions:

- `redo_text`
- `redo_asset`
- `fix_image`
- `approve`
- `approve_forever`
- `never_post`
- `reject`
- `try_again`
- `cancel_post`

Payload design should include:

- action
- `post_job_id`
- optional variation or token context

Implementation rule:

- callback handlers must edit the existing message when appropriate rather than spamming new approval posts

## Phase 6: Retry and Failure Workflow

Implement retry orchestration for missing/stale/broken dependencies.

Rules:

- retry delay: `10 minutes`
- max retries: `3`
- operator `Try Again` runs immediately
- operator `Cancel Post` ends the retry chain

Telegram failure notices must include:

- slot label
- attempt number
- exact reason
- next retry timing if any

After final failure:

- send terminal failure notice
- mark job cancelled or failed
- stop additional notifications

Validation:

- integration tests for attempt 1, 2, 3
- ensure cancelled jobs do not retry

## Phase 7: X Publication

Implement publish flow:

1. upload media
2. publish post text
3. store `external_post_id`
4. compute and store `x_post_url`
5. mark draft published
6. mark job posted
7. reply to Telegram with success link

Safety rules:

- prevent duplicate publish for a job already marked posted
- if media upload succeeds but tweet publish fails, preserve enough state for operator diagnosis
- log API response details without leaking secrets

Validation:

- sandbox/staging account test
- explicit duplicate-publish guard test

## Phase 8: Action Handlers

### `Redo Text`

- increment variation
- create new draft
- supersede previous draft
- update Telegram message caption only

### `Redo Asset`

- trigger refresh/re-render path
- post temporary rebuilding status
- update same Telegram approval message when done

### `Fix Image`

Implement exact priority order:

1. DB-known asset/logo data
2. local overrides
3. original Birdeye `logoURI`
4. alternate gateways
5. local upscale
6. fallback badge

Persist the recovery source so operator messages and audit history reflect what happened.

### `Approve Forever`

- approve and publish current job
- write slot-level autopost state to `system_settings`

### `Never Post`

- insert token into `blocked_tokens`
- ensure future candidate selection can consult the block list

## Phase 9: Scheduler and Internal Run Endpoint

Provide both:

- Railway cron hitting a protected internal route
- reusable in-process job function for manual operator retrigger

Suggested internal endpoint:

- `POST /internal/run-slot?slot=morning`

Protected by:

- `WORKER_SHARED_SECRET`

Cron plan:

- `8:10 AM ET` daily
- `12:10 PM ET` weekdays
- `5:10 PM ET` daily

## Phase 10: Observability and Ops

Add:

- structured JSON logs
- per-job correlation IDs
- job status transitions in logs
- action audit logs
- startup webhook registration logs

Minimum operator visibility:

- why a load failed
- why a publish failed
- which fallback fixed an image
- which draft variation was approved
- whether a slot is on autopost

## Testing Plan

### Unit Tests

- deterministic text templates
- callback payload parsing
- job status transition helpers
- retry scheduling math
- image-fix priority order

### Integration Tests

- slot run from load to awaiting approval
- failure -> retry -> terminal failure
- approval -> publish success
- redo text updates the draft chain
- reject stops processing
- approve forever writes settings
- never post inserts block row

### Manual Staging Checks

1. Trigger a slot run manually
2. Confirm Telegram approval message arrives
3. Use `Redo Text`
4. Use `Fix Image`
5. Approve and verify X URL saved
6. Trigger a forced missing-asset failure and confirm retry flow

## Rollout Plan

### Stage 1

- deploy with health check only
- validate config and DB connectivity

### Stage 2

- enable slot runs in dry-run mode
- send Telegram messages but disable live X publish

### Stage 3

- enable live publish for one post family and one slot

### Stage 4

- enable additional families and autopost selectively

## Risks

- duplicate publication if job idempotency is weak
- slot firing before upstream asset/render completion
- Telegram callback mismatch if message IDs are not persisted correctly
- image-fix path becoming too network-heavy if local cache checks are not first
- schema drift if target repo’s actual tables differ from the assumed names in this plan

## Required Prerequisites Before Coding

- confirm target repo/service language and framework
- confirm actual database schema names and ownership
- confirm slot-to-dataset mapping
- confirm staging X app credentials
- confirm Telegram bot token and operator chat ID
- confirm where the local logo override library will live
