'use strict';
/* Live post-quantum adoption figure for the hero stats bar.
 *
 * Reads Cloudflare Radar rather than hardcoding a number. The figure has moved
 * ~35 points in eighteen months; a stale one on a compliance vendor's homepage
 * is the same class of error as a misquoted regulator deadline.
 *
 * The Radar API needs a bearer token, so the call cannot happen in the browser —
 * a token in a public bundle is a token that has leaked. This function holds it
 * server-side and the page fetches /.netlify/functions/pq-stat instead.
 *
 * Setup: create a Cloudflare API token with the single permission
 * "Account > Radar > Read" (free tier is fine), then set it in Netlify under
 * Site settings > Environment variables:
 *
 *     CF_RADAR_TOKEN = <token>
 *
 * With the variable unset the function still answers 200 with the pinned
 * fallback below and stale:true. The homepage never breaks because a token
 * expired.
 */

/* Pinned fallback. Verified against Cloudflare Radar; re-check if it is still
   what the function is serving a year from now (the `stale` flag in the JSON
   tells you). */
const FALLBACK = { supported: 67, asOf: '2026-09', source: 'pinned' };

const CACHE_SECONDS = 6 * 60 * 60;
let cache = null; // survives while the lambda stays warm

exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    /* Cache at the CDN so Radar sees one call per six hours, not one per
       visitor. stale-while-revalidate keeps the page instant during a refresh. */
    'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=86400`,
  };

  if (cache && Date.now() - cache.at < CACHE_SECONDS * 1000) {
    return { statusCode: 200, headers, body: JSON.stringify(cache.payload) };
  }

  const token = process.env.CF_RADAR_TOKEN;
  if (!token) {
    return { statusCode: 200, headers, body: JSON.stringify({ ...FALLBACK, stale: true, reason: 'CF_RADAR_TOKEN not set' }) };
  }

  try {
    /* botClass=LIKELY_HUMAN matches the basis Cloudflare uses for the figure it
       publishes; without it the number includes bot traffic and reads lower. */
    const url = 'https://api.cloudflare.com/client/v4/radar/http/timeseries_groups/post_quantum'
      + '?dateRange=7d&aggInterval=1d&botClass=LIKELY_HUMAN&format=json';

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token }, signal: ctl.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error('Radar returned ' + res.status);

    const json = await res.json();
    const serie = json && json.result && json.result.serie_0;
    const supported = serie && Array.isArray(serie.SUPPORTED) ? serie.SUPPORTED : null;
    if (!supported || !supported.length) throw new Error('no SUPPORTED series in response');

    /* Last bucket, and only accept a plausible percentage — a malformed reply
       should fall back, not put a nonsense number in 30px type. */
    const latest = Number(supported[supported.length - 1]);
    if (!isFinite(latest) || latest <= 0 || latest > 100) throw new Error('implausible value: ' + latest);

    const payload = {
      supported: Math.round(latest),
      asOf: (json.result.meta && json.result.meta.lastUpdated) || new Date().toISOString(),
      source: 'cloudflare-radar',
    };
    cache = { at: Date.now(), payload };
    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  } catch (err) {
    /* Never fail the request. A hero stat is not worth a broken homepage. */
    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify({ ...FALLBACK, stale: true, reason: String(err.message || err) }),
    };
  }
};
