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

## Activate the form

The scan-request form posts to Formspree. **On the first submission**, Formspree
emails `simon@weaponsgrade.uk` asking you to confirm the endpoint. Click that
link or submissions are discarded silently.

Submit the form yourself once after deploying, then confirm.

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
