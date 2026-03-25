# Telegram Bot Setup

This document covers the minimum setup required for the planned `solana-diary-poster` service to send approval messages and receive operator actions.

## 1. Create the Bot

1. Open Telegram and message `@BotFather`
2. Run `/newbot`
3. Choose:
   - a bot display name
   - a bot username ending in `bot`
4. Copy the token BotFather returns

Store it as:

- `TELEGRAM_BOT_TOKEN`

## 2. Get the Operator Chat ID

The poster needs the chat ID for the operator conversation where approval messages should be sent.

Simple approach:

1. Start a chat with the new bot
2. Send a message like `hello`
3. Call Telegram `getUpdates` once:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates"
```

4. Find the `chat.id` in the response

Store it as:

- `TELEGRAM_CHAT_ID`

If approvals will happen in a private group instead of a direct chat:

1. add the bot to the group
2. send a message in the group
3. inspect `getUpdates`
4. use the group `chat.id`

## 3. Configure the Webhook

Planned webhook target:

```text
https://<poster-service>.railway.app/telegram/webhook
```

Set it with:

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://<poster-service>.railway.app/telegram/webhook"
```

Check it with:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

Expected result:

- webhook URL matches Railway service URL
- no recent delivery errors

## 4. Railway Environment Variables

Set these in the poster service:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `DATABASE_URL`
- `WORKER_SHARED_SECRET`
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`

## 5. Startup Behavior

Recommended behavior:

- on boot, the poster service registers or verifies the webhook
- startup logs should show webhook registration success or the exact failure reason

This avoids relying on a one-off manual webhook setup after each deploy.

## 6. Minimum Manual Test

After deploy:

1. confirm `/health` returns 200
2. send a manual message to the bot
3. verify the service receives a webhook event
4. trigger a dry-run approval message from the poster
5. tap an inline button and confirm the callback reaches the service

## 7. Troubleshooting

### No messages arriving

Check:

- bot token is correct
- chat ID is correct
- bot has been started by the operator
- group allows the bot to post if using a group

### Webhook not firing

Check:

- `getWebhookInfo`
- Railway public URL
- route exists at `POST /telegram/webhook`
- service logs for 4xx/5xx responses

### Inline buttons do nothing

Check:

- callback payload parsing
- message IDs are being persisted
- webhook body parsing is correct
- callback handler edits/replies are not throwing

### Telegram says the webhook is invalid

Check:

- the service is publicly reachable over HTTPS
- the webhook URL is exact
- there is no auth middleware blocking Telegram requests at the webhook route

## 8. Security Notes

- never log the raw bot token
- do not commit secrets to the repo
- treat Telegram callback data as untrusted input
- validate action payloads and job IDs server-side before mutating state
