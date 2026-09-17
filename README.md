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

---

## Artwork restored

The four quantum graphics were missing because the live site is a different
lineage from the earlier build that carried them — they were never lost, just
never in this file. They are now ported in:

| Where | Artwork |
|---|---|
| Threat section, right of the intro | Dilution refrigerator cutaway, 300 K to 10 mK |
| Band between Threat and How It Works | Superconducting qubit lattice |
| Standards section, right of the cards | Bloch sphere with state vector |
| Band between Standards and the CTA | Intercepted signal trace |

All four are hand-built inline SVG: no image files, no external requests, no
licensing exposure. `IMAGES.md` covers dropping real photographs into any of the
four slots — one attribute per slot, with an amber duotone applied
automatically — and the sourcing/licensing caveats worth reading first.

The cryostat used to anchor a two-column hero. This site's hero is centred over
an animated canvas and now carries the stats bar, so it went to the threat
intro instead, where the 600px copy column left the right half empty. Nothing
in the hero, logo, timeline or stats code was touched.

### Three layout bugs found while fitting them

**`1fr` is `minmax(auto, 1fr)`.** The card text's min-content width pushed the
standards grid wider than its share and squeezed the Bloch sphere to nothing.
Both split grids now use `minmax(0, …)` on every track.

**`margin-left: auto` makes a grid item content-sized**, not stretched — and an
SVG with only a `viewBox` and no `width` is 300px by default. That is why the
sphere rendered at 300px inside a 473px column regardless of its `max-width`.
Fixed with an explicit `width: 100%`.

**Source order beat the media queries.** The imagery CSS was appended at the end
of the stylesheet, after the existing `@media` blocks, so at equal specificity
the base rules won and the responsive overrides did nothing. The imagery's own
`@media` blocks now sit at the end, after the rules they override.

Verified at 390, 640, 768, 960, 1024, 1440 and 1920: artwork scales, single
column below 960, no horizontal overflow at any width, no page errors. Logo
still 120x72, stats clearance still 72px, both timelines unchanged.

---

## Type scale raised

The site was built on an 8–11px scale. That is a terminal-UI conceit, and it was
costing legibility on exactly the parts that carry the argument — the threat
timeline descriptions were 9px.

Reading text now has a 12px floor; short uppercase labels get a smaller lift;
display sizes are unchanged.

| | was | now |
|---|---|---|
| Threat timeline event | 10px | 13px |
| Threat timeline description | 9px | 12px |
| Threat timeline year | 11px | 13px |
| Threat card body | 11px | 13px |
| Compliance milestone label / description | 9 / 8px | 11 / 11px |
| Capability description / bullets | 10 / 9px | 12 / 12px |
| Use-case body | 10px | 12px |
| Standard name / description | 10 / 9px | 12 / 12px |
| Four-step body | 10px | 12px |
| Section intro | 13px | 14px |
| Badges, chips, eyebrows, credits | 7–9px | 9–10px |

Two columns were widened to stop the bigger type wrapping into narrow ribbons:
the timeline event column 184 → 290px (the connector line absorbs it), and the
compliance milestones 130 → 168px, which six across 1136px accommodates easily.

**One mobile consequence, fixed.** At 390px the timeline's fixed event column
plus the year and connector no longer fit the row. Rather than shrink the type
back, the connector line is hidden below 640px and the event text flexes to fill
the width. Panel padding drops from 28 to 18px to match.

Checked at 390, 640, 768, 960, 1024, 1440 and 1920: nothing clipped vertically
or horizontally in any of the resized blocks, no page overflow, no page errors.

---

## Cryostat photograph

`img/cryostat.jpg` now fills the threat-section slot, through the same
`data-photo` mechanism the slot was built for. The SVG cutaway stays underneath
as the fallback — verified: with the file 404ing, the artwork is still visible
and the photo element is removed from the DOM rather than left as a broken
image.

**It is cropped.** The original carried side panels reading "QUANTUM COMPUTING —
A BRIGHTER TOMORROW", "DISCOVER / SOLVE / ACCELERATE / TRANSFORM" and "SCIENCE
MEETS A BRIGHTER HUMANITY". That is quantum-computing boosterism, and it argues
the opposite of the page it would sit on — a reader who notices it reads the
site as less serious, not more. The crop takes the machine and the plinth and
leaves all of it out. 740x1060, 216KB, progressive JPEG.

**The amber duotone does the rest.** The photograph was already gold, and the
`#cq-duotone` filter maps it onto the exact brand ramp, so it reads as part of
the site rather than as a stock image dropped in. Scanlines and vignette come
from `.qimg::after` as with every other slot.

The slot was widened for it — a photograph earns more than line art did:
`.sec-split`'s second column 0.62fr → 0.86fr, `.qimg-machine` 420 → 520px, and
300px on a phone. The box carries `aspect-ratio: 74 / 106` to match the file, so
`object-fit: cover` is not cropping anything; change the ratio and it will.

One thing to confirm at your end: `data-credit` is empty because no credit came
with the image. If it is from a stock library or a generator with attribution
terms, put the line in that attribute — it prints bottom-right automatically.

Verified at 390, 640, 768, 960, 1024, 1440 and 1920: photo loads and scales, no
overflow, no page errors, fallback intact.

---

## Three-axis threat model added

The site argued HNDL and only HNDL. The platform has carried all three axes
since the DNEL merge, so the site was making a narrower case than the product
supports. New `#axes` section, between the Threat section and the lattice band:

- **The three-axis diagram** — `svg/axes.svg`, the bright rebuild, not the
  dimmed first version.
- **A four-row comparison table** — Property, The move, Detectable, Retired by,
  across HNDL / TNFL / DNEL, with the DNEL column lit.
- **The closing note** on why the last row is the one that matters.

**The axis definitions are lifted verbatim from the platform's own `AXES` array**
in `cipherq/index.html`, so the two surfaces cannot drift:

| | HNDL | TNFL | DNEL |
|---|---|---|---|
| Property | Confidentiality | Authenticity | Access & non-repudiation |
| The move | Traffic recorded today is read once a CRQC exists. | A recovered signing key mints new trusted artifacts. | Genuine credentials are presented. Nothing is forged, so nothing looks wrong. |
| Detectable | No — the capture is passive | Yes — a forged artifact exists to examine | No — nothing is anomalous |
| Retired by | Nothing. Captured traffic stays captured. | Re-issue under PQ signatures | Rotation |

The Detectable and Retired-by rows are the DNEL note's own table. The platform
renders a live risk level per axis from scan data; the site has no scan, so it
shows these static properties instead of a figure it cannot compute. Do not put
a hardcoded "HIGH" on a marketing page — it is the one number a prospect will
ask you to justify.

### Two structural notes

**It is a real `<table>`, not a grid of divs.** Four labelled rows compared
across three columns is a table; a screen reader should be told so.

**It stacks below 960px.** Each row becomes a labelled block with HNDL / TNFL /
DNEL sub-labels, via `data-axis` and `::before`, so every fact survives on a
phone. The diagram hides there — it is drawn on a 1380px canvas with 13px
labels, which scale to about 3px on a phone, worse than absent. The table is the
mobile version of the same content.

Verified at 390, 640, 768, 960, 1024, 1440 and 1920: table renders as a table at
1024 and up and as stacked blocks below, no clipping, no overflow, no page
errors. Logo, stats bar, both timelines, all five artwork slots and the cryostat
photograph all unchanged.
