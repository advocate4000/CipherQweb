# Deploying the CipherQ marketing site

One self-contained page. No build step, no server-side code.

## Why you got a 404

Netlify serves `index.html` at `/`. The page was previously named
`cipherq-marketing.html`, so the root path had nothing to serve. This folder
fixes that — the page is now `index.html`.

## Deploy

### Drag and drop (fastest)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag **this whole folder** (`cipherq-site`), not the individual file
3. Live in about ten seconds

To update an existing site instead of creating a new one: open the site →
**Deploys** → drag the folder onto the deploy area.

### Netlify CLI

```bash
npm install -g netlify-cli
cd cipherq-site
netlify deploy --prod
```

### From Git

Connect the repo, then set:

- **Base directory**: `cipherq-site`
- **Build command**: *(leave empty)*
- **Publish directory**: `cipherq-site`

The wrong publish directory is the other common cause of a 404.

## Contents

| File | Purpose |
|---|---|
| `index.html` | The entire site — HTML, CSS, JS inlined |
| `netlify.toml` | SPA fallback, security headers, cache policy |
| `robots.txt` | Allows indexing |

## The form

Uses **Netlify Forms** — built into the platform. No third-party account, no
endpoint ID, no confirmation email to click.

Netlify detects the form by parsing `index.html` at deploy time, so it only
becomes active *after* a deploy. It will not work when opening the file locally;
submitting there returns 404 and the page says so explicitly.

### After deploying

1. Site dashboard → **Forms** — you should see `scan-request` listed
2. **Forms → Settings → Form notifications** → add an email notification to
   `simon@weaponsgrade.uk`

Without step 2 submissions are still captured and visible in the dashboard, but
nothing lands in your inbox.

### If the form does not appear

Netlify only detects forms in HTML present at deploy time. If `scan-request` is
missing from the Forms tab, redeploy — a cached build can skip detection.

Spam is filtered by a honeypot field (`bot-field`) that is hidden from users.

Free tier covers 100 submissions per month.

## Check it worked

```bash
curl -I https://your-site.netlify.app/
```

Expect `HTTP/2 200`. If you see 404, the publish directory is wrong or you
uploaded the file rather than the folder.

## Custom domain

Site settings → **Domain management** → **Add custom domain**. Netlify issues a
Let's Encrypt certificate automatically. If you point `cipherq.io` here, update
the CTA links in `index.html` — they currently point at `cipherq.onrender.com`.
