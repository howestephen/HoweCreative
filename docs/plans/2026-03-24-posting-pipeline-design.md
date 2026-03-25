# Posting Pipeline Design

**Date:** 2026-03-24

**Status:** design approved for MVP documentation, not yet implemented in this repo

## Scope

Define the MVP design for a new standalone Railway service, `solana-diary-poster`, responsible for:

- scheduling recurring post slots
- generating deterministic X post copy from existing export payloads
- sending Telegram approval messages
- handling operator actions from Telegram
- publishing approved posts to X
- retrying and surfacing failures with clear operator controls

This service is adjacent to the current repo. The current repo is a Vite portfolio site; these docs capture the design and implementation plan for the planned poster service so the work can continue cleanly in a later codebase or monorepo expansion.

## Service Shape

The poster runs as a new standalone Railway service deployed beside the existing monitor and web services.

It shares only:

- Postgres
- Railway environment variables
- an internal auth pattern for protected worker-style endpoints

It does not depend on runtime imports from the existing services.

```text
existing monitor  ---> shared Postgres <--- existing web/dashboard
                               ^
                               |
                    new solana-diary-poster
```

## Responsibilities

The poster service owns:

- scheduled slot execution at `8:10 AM`, `12:10 PM`, and `5:10 PM` ET
- a Telegram webhook endpoint at `POST /telegram/webhook`
- deterministic text generation for post families
- publication to X
- retry and operator-error messaging
- autopost settings integration

The monitor remains responsible for dataset generation, asset rendering, and keeping the source tables fresh.

## Pipeline

### 1. Trigger

A job starts from either:

- a cron-driven slot run
- a new single-token candidate event

### 2. Load

The poster loads:

- the export payload for the target dataset/slot
- the rendered PNG asset
- any supporting metadata needed to explain freshness and failure state

If the data is valid and fresh, the job proceeds.

If the data is missing, stale, or broken, the service:

- sends a Telegram failure notification with the exact reason
- schedules a retry in `10 minutes`
- caps retries at `3`
- provides two operator actions:
  - `Try Again`
  - `Cancel Post`

Failure messages must always state:

- what was expected
- where it was looked up
- what was found instead
- the latest successful related state when available

Examples:

- rendered asset row missing for slot
- last dataset run failed due to upstream rate limit
- payload present but asset render missing
- latest render older than expected freshness window

After the third failed attempt, the service sends a final Telegram message and marks the job cancelled/failed for the slot.

### 3. Draft

For MVP, copy generation is deterministic, not AI-generated.

Each supported post family has a small set of template variations, for example:

- data-led
- hype
- dry/factual

`Redo Text` cycles through the available deterministic variations rather than calling a language model.

This keeps the system:

- predictable
- cheap
- auditable
- easy to review

### 4. Send for Approval

The poster sends a Telegram message containing:

- the PNG asset
- the current draft text
- action buttons

The Telegram message ID is stored so the message can be updated in place.

### 5. Wait

The job waits for a Telegram webhook callback.

### 6. Action

The operator chooses one of the actions below.

## Telegram Actions

### `Redo Text`

- rotate to the next deterministic template variation
- persist the new draft
- mark the previous draft superseded
- edit the existing Telegram message in place
- max `3` text variations before disabling further redo attempts

### `Redo Asset`

- trigger a fresh fetch/render for the slot
- send a temporary rebuilding status
- update the Telegram message when the asset is ready
- regenerate text only if the payload changed materially

### `Fix Image`

Order of operations:

1. check the local DB for a previously known usable logo or asset reference
2. check the local override library such as `assets/logos/`
3. retry the original Birdeye `logoURI`
4. try alternate IPFS / Arweave gateway variants
5. run local AI upscale if the image resolves but is too small
6. fall back to a deterministic badge

The bot should reply with the exact recovery path used, for example:

- `used DB logo cache`
- `used local override`
- `used fallback badge`

### `Approve`

- upload media to X
- publish the post
- store the publication record and external ID
- reply in Telegram with the X post URL
- mark the draft/job/approval state accordingly

### `Approve Forever`

Same as `Approve`, plus enable an autopost flag in `system_settings` for the specific post family and slot.

Example key:

- `auto_post_slot.trending_memecoins_24h.morning`

Once enabled:

- the slot bypasses Telegram approval
- the poster still logs publication state
- the operator gets a quiet Telegram confirmation when autopilot is enabled

Revocation is expected to happen from the dashboard later.

### `Never Post`

Single-token only.

- insert the token into `blocked_tokens`
- prevent future qualification and approval flows for that token
- allow later unblock via dashboard tooling

### `Reject`

- mark the job and approval rejected
- optionally capture a reason
- stop further processing for the slot/job

### Error Controls

From failure notifications:

- `Try Again` runs immediately instead of waiting for the scheduled retry
- `Cancel Post` stops retries, stops further Telegram reminders for that job, and records operator cancellation

## Data Model

The current conceptual schema assumes existing tables like `post_drafts`, `approvals`, `publications`, `rendered_assets`, and `system_settings` already exist in the target Solana system.

### New Table: `post_jobs`

One row per scheduled slot run or single-token trigger.

Suggested fields:

- `id`
- `slot_label`
- `dataset_slug`
- `scheduled_for`
- `status`
- `retry_count`
- `max_retries`
- `last_error`
- `error_detail`
- `post_draft_id`
- `rendered_asset_id`
- `approval_id`
- `publication_id`
- `tg_approval_message_id`
- `tg_chat_id`
- `cancelled_at`
- `cancelled_reason`
- `created_at`
- `updated_at`

Suggested states:

- `pending`
- `running`
- `awaiting_approval`
- `approved`
- `posted`
- `rejected`
- `cancelled`
- `failed`
- `skipped`

### New Table: `blocked_tokens`

Suggested fields:

- `id`
- `token_address` unique
- `token_symbol`
- `token_name`
- `blocked_at`
- `blocked_reason`
- `blocked_by_job_id`

### Changes to Existing Tables

`post_drafts`

- add `post_job_id`
- add `template_variation`

`approvals`

- add `post_draft_id`
- add `post_job_id`

`publications`

- add `post_draft_id`
- add `x_post_url`

`system_settings`

- reuse for autopost configuration
- do not create a separate settings table for MVP

## Scheduling

Planned cron schedule:

- `8:10 AM ET` every day
- `12:10 PM ET` weekdays
- `5:10 PM ET` every day

The `:10` offset leaves time for the upstream monitor/render work to complete.

## Secrets

Shared:

- `DATABASE_URL`
- `WORKER_SHARED_SECRET`

New:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`

Optional later:

- `ANTHROPIC_API_KEY` if copy generation ever moves beyond deterministic templates

## Railway Service Config

Planned file: `railway.poster.toml`

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "python -m solana_diary_poster"
healthcheckPath = "/health"
healthcheckTimeout = 10
restartPolicyType = "on_failure"
```

## Operational Notes

- Telegram message editing is a first-class requirement because the same approval message will be updated by `Redo Text`, `Redo Asset`, and `Fix Image`
- all failure states must be specific and operator-readable
- retries should be idempotent
- posting should be guarded against duplicate publishes for the same job
- autopost should remain slot-specific, not global

## MVP Boundaries

In scope:

- deterministic copy
- Telegram approval loop
- X posting
- explicit retry handling
- blocked single-token workflow
- autopost per slot family

Out of scope for MVP:

- AI-generated copy
- rich dashboard management UI beyond existing system settings patterns
- multi-operator review
- advanced experimentation or A/B testing

## Open Questions

- Which exact dataset families and slot-to-dataset mappings should ship first
- Whether `Redo Asset` should directly invoke monitor/render endpoints or enqueue work through a shared job mechanism
- How dashboard revocation and review of `blocked_tokens` should be exposed
- Whether publication dedupe is keyed by `post_job_id`, slot+date, or dataset snapshot hash
