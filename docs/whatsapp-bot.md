# WhatsApp practice-test bot

Learners message the business number, pick a K53 test, and answer with the buttons. A linked account with an active access grant (or a free-promo window) gets every test with no time limit. Everyone else gets 10 minutes on each test, once per WhatsApp number. Full access is bought on the website after the number is linked to an account.

The bot does not send a message first. WhatsApp only allows a reply inside the 24-hour window after the learner messages.

## Webhook

In the Meta app: **WhatsApp → Configuration → Webhook**.

| Setting | Value |
| --- | --- |
| Callback URL | `https://www.skdriving.co.za/api/whatsapp/webhook` |
| Verify token | the same string as `WHATSAPP_VERIFY_TOKEN` |
| Field to subscribe | `messages` |

The path is `/api/whatsapp/webhook` on whatever domain serves the site. Use the public production domain, not a deployment URL that asks for a Vercel login. Meta's servers must be able to reach that URL with no authentication, and they must be able to download question pictures from the same site (`/images/...`). If Deployment Protection is on, exempt this path and the picture files, or the webhook check and the road signs will fail.

`GET` answers Meta's hub challenge. `POST` rejects any body whose `X-Hub-Signature-256` was not made with `WHATSAPP_APP_SECRET`.

## Environment variables

Set these on the Vercel project for Production (and Preview, if a preview deployment should answer). Never commit the values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `WHATSAPP_TOKEN` | yes | WhatsApp Cloud API token. Use a permanent System User token in production. |
| `WHATSAPP_PHONE_NUMBER_ID` | yes | The phone number ID from the Meta app (the ID, not the phone number). |
| `WHATSAPP_APP_SECRET` | yes | Meta app secret. Checks that webhook calls really come from Meta. |
| `WHATSAPP_VERIFY_TOKEN` | yes | Any long random string you also paste into Meta's webhook form. |
| `WHATSAPP_GRAPH_VERSION` | no | Graph version, for example `v23.0`. Defaults to `v23.0`. |
| `WHATSAPP_SITE_URL` | no | Public site origin used in link buttons and picture URLs. Defaults to `https://www.skdriving.co.za`. No trailing path. |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL. Already used by the rest of the site. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key. The link page uses it to see who is logged in. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase **service_role** key, not the anon key. The webhook writes the `wa_*` tables, which have row-level security and no policies. An anon key in this slot makes every write fail. |

Until the four `WHATSAPP_*` values (token, phone number ID, app secret, verify token) are set, `POST` returns 503 and nothing is sent.

A stray space or line break at the end of a pasted value is ignored. The values themselves are never written to the logs.

This phone number is the Cloud API number in the Meta app. It is not automatically the sales number in `lib/contact.ts`. They are the same only if that handset has been added to the WhatsApp Business app.

Buying full access sends the learner to `/pricing`. Card checkout still needs the site's existing Yoco settings (`YOCO_SECRET_KEY`, `YOCO_WEBHOOK_SECRET`). Those are not read by the bot.

## Database

Run these in the Supabase SQL editor, in order. Both are safe to run more than once.

1. `scripts/migrations/28_whatsapp_bot.sql` — tables `wa_users`, `wa_link_codes`, `wa_quiz_sessions`, `wa_processed_messages`.
2. `scripts/migrations/29_whatsapp_one_open_session.sql` — one running test per WhatsApp number. A current copy of migration 28 already creates this index; run 29 as well if 28 was applied earlier.

A finished test on a **linked** account is also written to `quiz_attempts` and `user_answers` (migration 18, already required by the website) so it shows on the learner's progress. That write is skipped if it fails; the learner still gets their score in the chat.

## What to check after deploy

1. Meta's webhook screen shows the callback as verified.
2. The `messages` field is subscribed.
3. From a phone, send `hi`. The menu should arrive, with road-sign pictures on the questions that have them.
4. `LINK` opens `https://www.skdriving.co.za/whatsapp/link?code=…`. Logging in and confirming ties the number to the account. `BUY` (or Get full access) continues to `/pricing` when the account is not yet paid.
5. Vercel logs use the prefix `[whatsapp]`. A wrong app secret, a wrong phone number ID, or an anon key in the service-role slot is logged there without the secret itself.
