# CipherQ marketing site — CQ logo

**`index.html`** — deploy this. Self-contained; the logo script is inlined.

**`cq-logo.js`** — the logo, as a verbatim port of the platform's
`initCQLogo()`. Canonical source for both sites.

## What this version fixes

The previous attempt did not match the platform. It was ported from an earlier
marketing-site file rather than from the platform itself, and that file had
"improved" the drawing: font size derived from element height, scanline pitch
pinned to 2 CSS px, rendering at device-pixel resolution. Each change was
defensible on its own. Together they produced a visibly different mark —
thinner, washed out, weaker vignette, glow wrong against the glyphs.

This version is the platform's code. The drawing statements were diffed against
`initCQLogo()` and are identical apart from a `try/catch` around `getImageData`,
which only fires on a tainted canvas and changes nothing on screen.

## The constraint that matters

The routine is **not resolution-independent**. The glyphs are a fixed 52px, the
scanline pitch is 2px, the sweep is 12px, the blurs are 8/3/1px — all absolute,
all measured against a 120x72 backing store.

    <canvas class="cq-logo" width="120" height="72" …>   ← do not change
    .nav-logo .cq-logo { width: 90px; height: 54px; }     ← change this instead

Changing the **attributes** rescales the canvas around a glyph that stays 52px,
and the composition breaks. Changing the **CSS** scales the finished image and
the browser downsamples. 90x54 is 120:72 exactly and fits the 58px nav.

## Verified

    canvas attributes   120x72   (platform's, unchanged)
    displayed           90x54
    drawing code        identical to initCQLogo() bar one try/catch
    page errors         none

## Keeping them in step

`cq-logo.js` mounts `canvas.cq-logo` and `canvas#cq-canvas`, so one file drives
both sites. Point the platform at it too and the drift has nowhere to come from.

---

## Changes in this revision

**CNSA 2.0 dates corrected, in both timelines.** The site said 2027 was when
"new National Security Systems must use PQC-only algorithms." It is not.
Checked against the CNSA 2.0 FAQ (U/OO/194427-22, December 2024, Ver. 2.1):

| Date | What it actually says |
|---|---|
| 1 Jan 2027 | CNSSP 15: "all new acquisitions for NSS will be required to be CNSA 2.0 compliant unless otherwise noted" — an acquisition gate, i.e. support |
| 31 Dec 2030 | "all equipment and services that cannot support CNSA 2.0 must be phased out" |
| 31 Dec 2031 | "CNSA 2.0 algorithms are mandated for use unless otherwise noted" |
| 2035 | "all NSS will be quantum-resistant… in accordance with the goal espoused in NSM-10" |

The "2030 — OMB: all federal systems migrated" row was removed: no such OMB
deadline exists. NSM-10's federal endpoint is 2035. What is real for 2030 is
NIST IR 8547, which deprecates RSA and ECDH after 2030 and disallows them after
2035 — that is now what the row says.

The threat timeline gained a 2031 row. The compliance timeline kept six
milestones by merging 2030 and 2031 into one, so the horizontal spacing is
unchanged.

**Hero stats bar moved clear of the CTAs.** It was `position: absolute;
bottom: 0` inside a `#hero` with `padding-top: 80px` and no padding-bottom, so
hero content flowed underneath it. It is now in normal flow with
`margin-top: auto` — still parked at the bottom when there is spare height, but
the hero grows rather than the bar sliding up under the buttons. Clearance is
72px, set as `margin-bottom` on `.hero-content` and zeroed in the mobile query
where the bar is hidden.

Measured after the change: 72px gap at 768, 1024 and 1440; no horizontal
overflow at 390, 768, 1024 or 1440.

---

## Hero stats — live figure from Cloudflare Radar

The stats bar used to read `0 — Publicly Trusted CAs Issuing PQ Certificates`.
The fact was right and the framing was not: a zero on a hero reads as "nothing
is happening here" unless you already know that key exchange and signatures are
different problems. It now reads as a pair, in plain words:

    67%   Web traffic already quantum-safe
    0     Public certificates that are quantum-safe

Adjacent and parallel, so the contrast does the work with no jargon. Keep them
next to each other — split up, neither number means much.

`NIST PQC Standards Published — 3` came out to make room. It was the least
urgent of the four. Say the word and it goes back in place of something else.

### Wiring the 67% to Cloudflare

It is read live, because it moves — 32% in January 2025, around two-thirds now.
A stale number on a compliance vendor's homepage is the same class of error as a
misquoted regulator deadline.

Radar's API needs a bearer token, so the call cannot happen in the browser; a
token in a public bundle is a token that has leaked. `netlify/functions/pq-stat.js`
holds it server-side and the page fetches `/.netlify/functions/pq-stat`.

**Setup, once.** In Cloudflare, create an API token whose only permission is
*Account → Radar → Read* (free tier is enough). In Netlify, Site settings →
Environment variables:

    CF_RADAR_TOKEN = <token>

Redeploy. That is all — the function is picked up automatically from
`netlify/functions/`.

**It cannot break the homepage.** Every failure path — no token, 403, expired
token, malformed reply, an implausible number, a timeout, the site opened from
disk — returns 200 with a pinned 67 and `stale: true`, and the page falls back
to the same figure if the fetch itself fails. All seven paths were tested.
Checking `stale` in the JSON tells you whether the live feed is actually working:

    curl https://cipherq.co/.netlify/functions/pq-stat

Results are cached six hours in the function and at the CDN, so Radar sees one
call every six hours rather than one per visitor.

Verified after the change: 72px clearance above the bar at 768, 1024 and 1440;
bar hidden at 390 as before; no horizontal overflow at any width; no page
errors; live value and fallback value both paint correctly.
