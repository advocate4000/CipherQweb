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

### Setup — form detection is OFF by default

Since April 2023 Netlify disables form detection on all new sites. Correct
markup is not enough; the site will 404 on submit until you switch it on.

1. **Forms → Usage and configuration → Form detection → Enable form detection**
2. **Redeploy.** Enabling does not retroactively scan existing deploys — the
   next deploy is when the form is registered.
3. Confirm `scan-request` now appears under **Forms**
4. **Forms → Settings → Form notifications** → add an email notification to
   `simon@weaponsgrade.uk`

Without step 4 submissions are captured and visible in the dashboard, but
nothing reaches your inbox.

### If submitting returns 404 ("Form not registered")

Netlify received the POST but has no form bound to it. In order of likelihood:

1. **Form detection is disabled.** Off by default on every site created since
   April 2023. Enable it under **Forms → Usage and configuration → Form
   detection**, then *redeploy* — enabling alone does not scan existing deploys.
   This is by far the most common cause and correct markup will not save you.
2. **A catch-all redirect is intercepting the POST.** Any
   `/* -> /index.html 200` rule in `netlify.toml` or `_redirects` swallows the
   submission before the form handler runs. This config deliberately has none.
   Restricting such a rule by request method does not help — `Method` is not a
   supported redirect condition.
3. **You are testing locally.** Netlify Forms only exist on the deployed site.
   The page detects this and says so rather than showing a generic error.

The browser console carries the same checklist on failure.

### Requirements the markup already satisfies

`data-netlify="true"`, a unique form `name`, unique `name` on every input, a
hidden `form-name` field matching the form name, a url-encoded POST body, and
every field present in the static HTML. If you edit the form, keep all six.

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
