# CipherQ marketing site — image slots

Three of the four visuals are hand-built SVG artwork inside the HTML: no image
files, no external requests, no licensing exposure. The fourth — the cryostat in
the threat section — is a photograph, `img/cryostat.jpg`. Photographs are
optional upgrades, slot by slot, and nothing breaks if one goes missing: the
artwork underneath is still there and simply stays.

**`img/cryostat.jpg` is a supplied image.** It was cropped from a wider original
to remove the side panels, which carried "QUANTUM COMPUTING — A BRIGHTER
TOMORROW" and similar copy that argues the opposite of everything else on the
page. Its `data-credit` is empty because none was given. If it came from a
stock library or a generator with attribution terms, put the credit line in that
attribute and it prints bottom-right.

## Adding a photo

One attribute. Nothing else changes.

```html
<figure class="qimg qimg-machine" data-photo="img/cryostat.jpg" data-credit="Credit: NIST">
```

On load the photo fades in over the artwork, the amber duotone and CRT overlay
are applied automatically, and the credit prints bottom-right. If the file is
missing or fails to load, the artwork simply stays and a warning goes to the
console — the page never shows a broken image.

Leave `data-photo=""` and the artwork stands on its own.

## The four slots

| Slot | Where | Artwork it carries | What suits a photo here |
|---|---|---|---|
| `.qimg-machine` | Threat section, right of the intro copy | **Photograph in use** (`img/cryostat.jpg`); SVG dilution-refrigerator cutaway underneath as the fallback | Filled. Swap the file to change it, or clear `data-photo` to go back to the artwork. |
| First `.qband` | Between Threat and How It Works | Superconducting qubit lattice | A qubit chip or wafer close-up. Wide crop; the text sits on the left third. |
| `.std-split .qimg` | Standards section, right of the four cards | Bloch sphere with state vector | Roughly square. The artwork is stronger here than most photos. |
| Second `.qband` | Between Standards and the CTA | Intercepted signal trace | Wide crop, text on the right third. Also better as artwork than stock. |

The cryostat used to sit in a two-column hero. The live hero is centred over an
animated canvas and carries the stats bar, so it moved to the threat intro
rather than restructuring a hero that works.

Recommended sizes: cryostat ~1400x1800, bands ~2400x900. Put them in `img/`
beside `index.html`. Everything gets `object-fit: cover`, so exact ratios don't
matter.

## Sourcing — read this before you use anything

**The licensing is not as simple as "it's a government photo."** Works by US
federal employees carry no US copyright, but that does not automatically clear
a photo for commercial marketing, and agencies apply their own terms on top.

Two specifics I verified:

- **[quantum.gov's Quantum Image Gallery](https://www.quantum.gov/quantum-image-gallery/)**
  is the best starting point. It states images "may be freely reused with
  appropriate citations," and aggregates NIST, Fermilab, Argonne, Oak Ridge,
  Berkeley, NASA, NSF and NRL. Dilution refrigerators, ion traps, qubit chips.
- **NIST's own image pages are narrower than you'd expect.** The
  [Dilution Refrigerator](https://www.nist.gov/image/dilution-refrigerator) page
  states the image may be used without charge *for editorial articles mentioning
  NIST*, and that commercial or stock-art use **requires permission** and may
  involve photographer fees. A marketing site selling a product is commercial
  use. So: check each image's own page, and email NIST rather than assume.

Verified candidates, with credit lines exactly as published:

| Image | Credit | Page |
|---|---|---|
| FormFactor dilution refrigerator — coldest four stages, Boulder Cryogenic Quantum Testbed | `NIST` | [nist.gov](https://www.nist.gov/image/formfactor-dilution-refrigerator) |
| NIST racetrack ion trap — 150 zones for storing and probing ions | `J. Amini/NIST` | [nist.gov](https://www.nist.gov/image/racetrackiontrapjpg) |
| Dilution Refrigerator | `Photo courtesy of the National Institute of Standards and Technology (NIST)` | [nist.gov](https://www.nist.gov/image/dilution-refrigerator) — **commercial use needs permission** |

One more caution worth naming: **avoid photos that identify a specific vendor's
hardware.** IBM's and Google's press images are widely reproduced, but putting a
recognisable IBM machine on a page selling a security product reads as
endorsement, and that is a trademark problem rather than a copyright one.
quantum.gov attaches its own version of this disclaimer to the gallery.

If none of that is worth the effort, the artwork is already there and costs you
nothing.

## Tuning the treatment

The duotone is an SVG filter (`#cq-duotone`, defined at the top of `<body>`)
mapping image luminance onto a black → amber → pale-gold ramp. It was measured,
not eyeballed: a cold blue test photo comes out at hue 33–37°, against the brand
amber's 36.1°.

- **Photos too bright or too dark:** change `brightness(0.72)` in the
  `.qimg-photo` rule. That is the one number to reach for first.
- **Want more or less colour:** edit the `tableValues` on `feFuncR/G/B`. Five
  stops each, shadows → highlights.
- **Want the photo's own colours back:** delete the second `filter` line in
  `.qimg-photo`. The CSS fallback chain on the line above still gives a softer
  sepia; delete both for untreated.
- **Scanlines and vignette** live in `.qimg::after`, separately from the duotone,
  so you can drop one and keep the other.

Artwork animation is paused automatically for visitors with
`prefers-reduced-motion` set.
