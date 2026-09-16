/* CipherQ CQ logo — CRT canvas mark.
 *
 * VERBATIM PORT of initCQLogo() from the platform header (index.html on
 * cipherq.onrender.com). The drawing code below is byte-for-byte the platform's
 * apart from one change: it mounts every `canvas.cq-logo` instead of the single
 * `#cq-canvas`, so the same file serves both sites.
 *
 * Do not "improve" the drawing. An earlier version of this file scaled the
 * artwork to the element size — font size derived from height, scanline pitch
 * held at 2 CSS px, rendering at device-pixel resolution. Every one of those
 * was defensible on its own and the result was visibly not the platform's mark:
 * thinner, washed out, a weaker vignette, the glow wrong relative to the
 * glyphs. If the two marks are to be the same mark, this code has to be the
 * same code.
 *
 * Because the routine is not resolution-independent — 52px font, 2px scanline
 * pitch, 6px sweep and 8/3/1px blurs are all absolute — the canvas must keep
 * its intrinsic 120x72 backing store. Size it for a given layout with CSS
 * only, and let the browser downsample:
 *
 *     <canvas class="cq-logo" width="120" height="72"
 *             role="img" aria-label="CipherQ">…svg fallback…</canvas>
 *
 *     .nav-logo .cq-logo { width: 90px; height: 54px; }    <- 120:72 exactly
 *
 * Changing width/height ATTRIBUTES rescales the artwork inside a fixed 52px
 * glyph and breaks the composition. Changing the CSS size does not.
 */
(function () {
  function mount(canvas) {
    /* Supersede any earlier loop on this element rather than stacking a
       second one — safe to run the file twice. */
    var gen = (canvas._cqGen = (canvas._cqGen || 0) + 1);

    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var AMBER = '#f09a18', AMBER_CORE = '#fff4cc';
    var frame = 0, sweepY = 0, flicker = 1.0, flickerTarget = 1.0, flickerCooldown = 0;
    var glitchShift = 0, glitchTimer = 0;

    function drawFrame() {
      if (canvas._cqGen !== gen) return;        // a newer mount owns this canvas
      frame++;
      if (flickerCooldown > 0) { flickerCooldown--; }
      else if (Math.random() < 0.018) { flickerTarget = 0.05 + Math.random()*0.3; flickerCooldown = 1+Math.floor(Math.random()*3); }
      else if (Math.random() < 0.03)  { flickerTarget = 0.7  + Math.random()*0.3; flickerCooldown = 2+Math.floor(Math.random()*4); }
      else { flickerTarget = 0.88 + Math.random()*0.12; }
      flicker += (flickerTarget - flicker) * 0.35;

      glitchTimer--;
      if (glitchTimer <= 0) {
        glitchShift = Math.random() < 0.08 ? (Math.random()-0.5)*6 : 0;
        glitchTimer = 5+Math.floor(Math.random()*20);
      }

      ctx.clearRect(0,0,W,H);
      var bloom = ctx.createRadialGradient(W/2,H/2,4,W/2,H/2,W*0.7);
      bloom.addColorStop(0,'rgba(240,154,24,'+(0.06*flicker)+')'); bloom.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = bloom; ctx.fillRect(0,0,W,H);

      ctx.font = "900 52px 'Courier New', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var cx = W/2+glitchShift, cy = H/2+2;
      ctx.save(); ctx.filter='blur(8px)'; ctx.globalAlpha=0.35*flicker; ctx.fillStyle=AMBER; ctx.fillText('CQ',cx,cy); ctx.restore();
      ctx.save(); ctx.filter='blur(3px)'; ctx.globalAlpha=0.55*flicker; ctx.fillStyle=AMBER; ctx.fillText('CQ',cx,cy); ctx.restore();
      ctx.save(); ctx.filter='none';      ctx.globalAlpha=flicker;      ctx.fillStyle=AMBER; ctx.fillText('CQ',cx,cy); ctx.restore();
      ctx.save(); ctx.filter='blur(1px)'; ctx.globalAlpha=0.25*flicker; ctx.fillStyle=AMBER_CORE; ctx.fillText('CQ',cx,cy); ctx.restore();

      for (var y=0; y<H; y+=2) { ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(0,y,W,1); }
      sweepY = (sweepY+0.8)%H;
      var sweep = ctx.createLinearGradient(0,sweepY-6,0,sweepY+6);
      sweep.addColorStop(0,'rgba(255,220,120,0)'); sweep.addColorStop(0.5,'rgba(255,220,120,0.32)'); sweep.addColorStop(1,'rgba(255,220,120,0)');
      ctx.fillStyle=sweep; ctx.fillRect(0,sweepY-6,W,12);

      if (frame%2===0) {
        /* getImageData throws on a tainted canvas; the grain is the only part
           that needs readback, so lose the grain rather than the mark. */
        try {
          var id=ctx.getImageData(0,0,W,H); var d=id.data;
          for (var i=0;i<d.length;i+=16) { var n=(Math.random()-0.5)*28; d[i]=Math.min(255,Math.max(0,d[i]+n)); d[i+1]=Math.min(255,Math.max(0,d[i+1]+n*0.6)); d[i+2]=Math.min(255,Math.max(0,d[i+2]+n*0.1)); }
          ctx.putImageData(id,0,0);
        } catch (e) {}
      }
      var vig=ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,W*0.75);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,0.55)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
      requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);
  }

  function mountAll() {
    var list = document.querySelectorAll('canvas.cq-logo, canvas#cq-canvas');
    for (var i = 0; i < list.length; i++) mount(list[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
