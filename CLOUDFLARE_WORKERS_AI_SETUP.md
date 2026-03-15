# Cloudflare Workers AI Setup

This project now supports Cloudflare Workers AI as the chatbot backend.

## 1) Deploy the Worker

Run these commands from `website/cloudflare-worker`:

```powershell
npx wrangler login
npx wrangler deploy
```

After deploy, copy your Worker URL (for example: `https://health-chatbot-worker.<subdomain>.workers.dev`).

## 2) Point frontend to Worker URL

If your site and Worker are on different domains, set this before `script.js` loads:

```html
<script>
  window.CHATBOT_API_BASE_URL = "https://health-chatbot-worker.<subdomain>.workers.dev";
</script>
```

If your site routes `/api/*` to the Worker on the same domain, you do not need this setting.

## 3) Restrict CORS in production

Edit `website/cloudflare-worker/wrangler.toml`:

```toml
ALLOWED_ORIGIN = "https://your-site-domain"
```

Then redeploy:

```powershell
npx wrangler deploy
```

## 4) Optional model changes

In `website/cloudflare-worker/wrangler.toml`, update:

- `CHAT_MODEL`
- `TRANSLATE_MODEL`

Then run `npx wrangler deploy` again.
