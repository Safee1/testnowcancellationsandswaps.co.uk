// Builds /test-centres/<slug>.html for every DVSA practical test centre, plus
// /test-centres/index.html, and rewrites sitemap.xml. Free search traffic:
// learners search "<centre> driving test cancellation / swap", and before this
// the site had no page for any single centre.
//
// Run:  node tools/build-centre-pages.mjs            (fetches the live centre list)
//       node tools/build-centre-pages.mjs --offline  (uses tools/centres.json)
// Re-run whenever the centre list changes. Pages are static; the live tests on
// each page are fetched from the public ?action=board endpoint in the browser.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SITE = "https://testnowcancellationsandswaps.co.uk";
const API = "https://script.google.com/macros/s/AKfycbxpAa2f8VaJvKwQspRz0QEsp9KZIB_7ZIkMwskYPl2zjLgtsqoi8l_PqpvrtpQ7c2JO/exec";
const OUT = path.join(ROOT, "test-centres");
const SNAP = path.join(ROOT, "tools", "centres.json");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s) => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function loadCentres() {
  if (!process.argv.includes("--offline")) {
    const r = await fetch(API + "?action=centres");
    const d = await r.json();
    if (d.result === "success" && Array.isArray(d.centres) && d.centres.length > 50) {
      fs.writeFileSync(SNAP, JSON.stringify(d.centres, null, 1));
      return d.centres;
    }
    throw new Error("live centre list looked wrong; re-run with --offline to use the snapshot");
  }
  return JSON.parse(fs.readFileSync(SNAP, "utf8"));
}

const HEAD_TRACKING = `<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', { 'ad_storage': 'denied', 'ad_user_data': 'denied', 'ad_personalization': 'denied', 'analytics_storage': 'denied', 'wait_for_update': 500 });
  (function () {
    var m = document.cookie.match('(^|;)\\\\s*tn_consent_v2\\\\s*=\\\\s*([^;]+)');
    if (m && m.pop() === 'yes') gtag('consent', 'update', { 'ad_storage': 'granted', 'ad_user_data': 'granted', 'ad_personalization': 'granted', 'analytics_storage': 'granted' });
  })();
  gtag('js', new Date());
  gtag('config', 'AW-18364427323');
  gtag('config', 'G-THEHZYLS0C');
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18364427323"></script>
<script src="/assets/attribution.js"></script>`;

const CSS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --ink:#0A6B36; --ink-soft:#037434; --paper:#F5F0E6; --paper-warm:#EBE3D2; --accent:#C3135F; --muted:#58685F; --line:rgba(10,107,54,.18); }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Inter Tight',system-ui,sans-serif; background:var(--paper); color:#14241b; line-height:1.6; font-size:16px; }
  a { color:var(--ink); }
  .wrap { max-width:760px; margin:0 auto; padding:0 16px; }
  header.top { background:var(--ink); color:#fff; padding:14px 0; }
  header.top a { color:#fff; text-decoration:none; font-weight:600; }
  header.top .wrap { display:flex; justify-content:space-between; align-items:center; gap:12px; }
  header.top .home { font-family:'Fraunces',serif; font-size:19px; }
  nav.crumbs { font-size:13px; color:var(--muted); margin:18px 0 6px; }
  nav.crumbs a { color:var(--muted); }
  h1 { font-family:'Fraunces',serif; font-size:clamp(26px,6vw,38px); line-height:1.15; color:var(--ink); margin:6px 0 12px; }
  h2 { font-family:'Fraunces',serif; font-size:22px; color:var(--ink); margin:30px 0 10px; }
  p.lede { font-size:18px; color:#24372c; }
  .cta { display:inline-block; background:var(--accent); color:#fff; font-weight:600; text-decoration:none; padding:14px 22px; border-radius:12px; margin:18px 0 6px; min-height:44px; }
  .cta.ghost { background:transparent; color:var(--ink); border:1.5px solid var(--ink); margin-left:6px; }
  .note { font-size:13px; color:var(--muted); }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:16px; margin:10px 0; }
  ul.tests { list-style:none; }
  ul.tests li { display:flex; justify-content:space-between; gap:10px; padding:10px 0; border-bottom:1px solid var(--line); font-size:15px; flex-wrap:wrap; }
  ul.tests li:last-child { border-bottom:none; }
  .pill { font-size:12px; background:var(--paper-warm); border-radius:20px; padding:2px 10px; color:var(--muted); white-space:nowrap; }
  ol.steps { padding-left:20px; } ol.steps li { margin:6px 0; }
  ul.near { list-style:none; } ul.near li { padding:6px 0; }
  .grid { columns:2 220px; column-gap:24px; } .grid a { display:block; padding:4px 0; break-inside:avoid; }
  details { background:#fff; border:1px solid var(--line); border-radius:12px; padding:12px 14px; margin:8px 0; }
  summary { font-weight:600; cursor:pointer; }
  footer { margin:40px 0 0; padding:24px 0 40px; border-top:1px solid var(--line); font-size:13px; color:var(--muted); }
  footer a { color:var(--muted); margin-right:12px; }
</style>`;

function shell({ title, desc, canonical, body, jsonld }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
${HEAD_TRACKING}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="TestNow Cancellations & Swaps">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="TestNow Cancellations &amp; Swaps"><meta property="og:image" content="${SITE}/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
${CSS}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>
<body>
<header class="top"><div class="wrap"><a class="home" href="/">TestNow</a><a href="/#swap-form">List your test — free</a></div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
  <p>TestNow is a free, independent service for UK learner drivers. It is not DVSA. Every swap is completed by phoning DVSA on 0300 200 1122 — nobody can sell you a test date.</p>
  <p style="margin-top:10px;"><a href="/">Home</a><a href="/test-centres/">All test centres</a><a href="/guides/">Guides</a>${REGION_LINKS}<a href="/find-instructor.html">Find an instructor</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/report-concern.html">Report a concern</a></p>
</div></footer>
</body>
</html>
`;
}

let REGION_LINKS = ""; // filled once the centre list is loaded: one crawlable link per region hub on every page

function regionPage(region, list, allRegions) {
  const r = slug(region);
  const url = `${SITE}/test-centres/${r}/`;
  const sorted = [...list].sort((a, b) => a.centre.localeCompare(b.centre));
  const body = `
<nav class="crumbs"><a href="/">TestNow</a> › <a href="/test-centres/">Test centres</a> › ${esc(region)}</nav>
<h1>Driving test swaps in ${esc(region)}</h1>
<p class="lede">${sorted.length} DVSA practical test centres in ${esc(region)}. Pick yours to see live tests nearby and list your own for a free swap with another learner. Swaps are completed by phoning DVSA on 0300 200 1122 — nobody can sell you a date.</p>
<a class="cta" href="/#swap-form">List my test — free</a><a class="cta ghost" href="/#board">Browse all tests</a>
<h2>Test centres in ${esc(region)}</h2>
<div class="grid">${sorted.map((c) => `<a href="/test-centres/${slug(c.centre)}.html">${esc(c.centre)}</a>`).join("")}</div>
<h2>Other regions</h2>
<div class="grid">${allRegions.filter((x) => x !== region).map((x) => `<a href="/test-centres/${slug(x)}/">${esc(x)}</a>`).join("")}</div>
<p class="note" style="margin-top:18px;">Tip: you can list the centres you would accept as well as your own, so a swap with a nearby centre in ${esc(region)} counts too.</p>`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "TestNow", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: "Test centres", item: SITE + "/test-centres/" },
    { "@type": "ListItem", position: 3, name: region, item: url } ] }];
  return { dir: r, html: shell({ title: `Driving test swaps in ${region} — ${sorted.length} DVSA centres | TestNow`, desc: `Swap your practical driving test at any of the ${sorted.length} DVSA test centres in ${region}. Free, anonymous matching with another learner; the swap is made by phoning DVSA.`, canonical: url, body, jsonld }) };
}

function centrePage(c, bySlug, sameRegion) {
  const s = slug(c.centre);
  const url = `${SITE}/test-centres/${s}.html`;
  const near = (c.moves || []).map((m) => {
    const [name, dist] = String(m).split(" - ");
    const target = bySlug.get(slug(name.trim()));
    return { name: name.trim(), dist: (dist || "").trim(), href: target ? `/test-centres/${slug(name.trim())}.html` : "" };
  });
  const nearNames = near.map((n) => n.name);
  const title = `${c.centre} driving test swap — free, faster than waiting | TestNow`;
  const desc = `Swap your DVSA practical test at ${c.centre}${c.centre.includes("(") ? "" : " (" + c.region + ")"} with another learner. See live tests near ${c.centre}${nearNames[0] ? ", " + nearNames.slice(0, 2).join(" and ") : ""}. Free, anonymous, done by phoning DVSA.`;
  const faq = [
    [`Can I swap my driving test at ${c.centre}?`, `Yes. Swaps are done by phoning DVSA on 0300 200 1122, and both learners must hold a live booking. List your ${c.centre} test on TestNow and we match you with someone who wants your date and has one you want, at ${c.centre} or a nearby centre.`],
    [`Which centres are near ${c.centre}?`, near.length ? `The nearest centres we match with are ${near.map((n) => n.name + (n.dist ? " (" + n.dist.replace(/^about /, "about ") + ")" : "")).join(", ")}.` : `We match you with learners at ${c.centre} and nearby centres in ${c.region}.`],
    ["Does it cost anything?", "No. TestNow is free for learners. A swap only ever happens by phoning DVSA on 0300 200 1122. If anyone asks you to pay for a test date, it is a scam."],
    ["Is my phone number shared?", "No. You are matched in an anonymous chat and only ever see the other person as a label. Phone numbers, emails and links are removed automatically."],
  ];
  const jsonld = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "TestNow", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Test centres", item: SITE + "/test-centres/" },
      { "@type": "ListItem", position: 3, name: c.region, item: SITE + "/test-centres/" + slug(c.region) + "/" },
      { "@type": "ListItem", position: 4, name: c.centre, item: url } ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  const listHref = `/?centre=${encodeURIComponent(c.centre)}#swap-form`;
  const body = `
<nav class="crumbs"><a href="/">TestNow</a> › <a href="/test-centres/">Test centres</a> › <a href="/test-centres/${slug(c.region)}/">${esc(c.region)}</a> › ${esc(c.centre)}</nav>
<h1>Swap your driving test at ${esc(c.centre)}</h1>
<p class="lede">Got a practical test at ${esc(c.centre)} that's too far away, or too soon? Swap it with another learner who wants yours. Free, anonymous, and done properly through DVSA.</p>
<p class="note">${esc(c.centre)} is a DVSA practical test centre in ${esc(c.region)}.${near.length ? ` The centres we treat as nearby are ${near.map((x) => esc(x.name) + (x.dist ? " (" + esc(x.dist) + ")" : "")).join(", ")}, so a learner at any of them can be matched with you.` : ""} Waiting times at ${esc(c.centre)} change week to week — the live list below shows what learners have actually put up for swap right now, which is a better guide than any published average.</p>
<a class="cta" href="${listHref}">List my ${esc(c.centre)} test — free</a><a class="cta ghost" href="/#board">Browse all tests</a>
<p class="note">Takes about a minute. We text or email you the moment there's a match.</p>

<h2>Tests available at ${esc(c.centre)} and nearby</h2>
<div class="card" id="live"><p class="note">Loading live tests…</p></div>
<noscript><p class="note">Turn on JavaScript to see live tests, or <a href="/#board">browse the full board</a>.</p></noscript>

<h2>How a swap at ${esc(c.centre)} works</h2>
<ol class="steps">
  <li>List your current ${esc(c.centre)} test and the dates or centres you'd accept instead.</li>
  <li>We match you automatically with a learner whose test you want and who wants yours.</li>
  <li>You both get a private chat link. Nobody sees your name or number.</li>
  <li>One of you phones DVSA on 0300 200 1122 to make the swap. DVSA confirms with both of you.</li>
</ol>

${near.length ? `<h2>Centres near ${esc(c.centre)}</h2>
<ul class="near">${near.map((n) => `<li>${n.href ? `<a href="${n.href}">${esc(n.name)}</a>` : esc(n.name)}${n.dist ? ` <span class="pill">${esc(n.dist)}</span>` : ""}</li>`).join("")}</ul>
<p class="note">We match you with learners at these centres too, so you have more chances of a swap.</p>` : ""}

<h2>Questions</h2>
${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p style="margin-top:8px;">${esc(a)}</p></details>`).join("\n")}

${sameRegion.length ? `<h2>Other test centres in ${esc(c.region)}</h2>
<div class="grid">${sameRegion.map((o) => `<a href="/test-centres/${slug(o.centre)}.html">${esc(o.centre)}</a>`).join("")}</div>` : ""}

<a class="cta" href="${listHref}">List my ${esc(c.centre)} test — free</a>

<script>
(function () {
  var API = ${JSON.stringify(API)};
  var HERE = ${JSON.stringify(c.centre)};
  var NEAR = ${JSON.stringify(nearNames)};
  var box = document.getElementById('live');
  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function daysUntil(iso) {
    if (!iso || !/^\\d{4}-\\d{2}-\\d{2}$/.test(iso)) return null;
    var t = new Date(iso + 'T00:00:00');
    var now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  }
  fetch(API + '?action=board').then(function (r) { return r.json(); }).then(function (d) {
    var all = (d && d.listings) || [];
    var here = all.filter(function (l) { return l.centre === HERE; });
    var near = all.filter(function (l) { return NEAR.indexOf(l.centre) !== -1; });
    // 26 Sep: soonest first within "here" and within "near" (was sheet order —
    // Hornchurch showed 21 Oct, 5 Jan, 29 Oct).
    var byDateTime = function (a, b) { return String((a.date || '') + ' ' + (a.time || '')).localeCompare(String((b.date || '') + ' ' + (b.time || ''))); };
    here.sort(byDateTime); near.sort(byDateTime);
    // 3 Oct: one merged list, soonest first (here-then-near still showed Hornchurch 5 Jan before Goodmayes 2 Dec).
    var rows = here.concat(near).sort(byDateTime).slice(0, 12);
    var summary = '';
    if (here.length) {
      var firstL = here.filter(function (l) { return l.date; }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); })[0];
      var earliest = firstL ? firstL.date : null;
      if (earliest) {
        var d = daysUntil(earliest);
        var wk = d !== null ? Math.max(0, Math.round(d / 7)) : null;
        summary = '<p class="note" style="margin-bottom:10px;"><b>Tests listed at ' + esc(HERE) + ' now: ' + here.length + '</b> · earliest: ' + esc(firstL.dateLabel || earliest) + (wk !== null ? ' (' + wk + (wk === 1 ? ' week' : ' weeks') + ' away)' : '') + '</p>';
      }
    } else if (near.length) {
      summary = '<p class="note" style="margin-bottom:10px;">No tests listed at ' + esc(HERE) + ' right now, but ' + near.length + ' nearby. <a href="/?centre=' + encodeURIComponent(HERE) + '#swap-form">List yours</a> and we\\'ll match you as soon as one appears.</p>';
    }
    if (!rows.length) {
      box.innerHTML = (summary || '') + '<p>No tests listed at ' + esc(HERE) + ' or nearby right now. <b>Be the first:</b> list yours and we\\'ll match you as soon as someone near you joins.</p>';
      return;
    }
    box.innerHTML = summary + '<p class="note" style="margin-bottom:6px;">' + here.length + ' at ' + esc(HERE) + ', ' + near.length + ' nearby. Updated live.</p><ul class="tests">' +
      rows.map(function (l) { return '<li><span><b>' + esc(l.centre) + '</b> · ' + esc(l.dateLabel || l.date) + (l.time ? ' · ' + esc(l.time) : '') + '</span>' + (l.status === 'matching' ? '<span class="pill">In a chat already</span>' : '<span class="pill">Available</span>') + '</li>'; }).join('') + '</ul>' +
      '<p style="margin-top:10px;"><a href="/test-availability.html">See live availability by centre</a> · <a href="/#board">Browse the full board</a></p>';
  }).catch(function () { box.innerHTML = '<p>Live tests are on the <a href="/#board">main board</a>.</p>'; });
})();
</script>`;
  return { file: `${s}.html`, html: shell({ title, desc, canonical: url, body, jsonld }) };
}

function indexPage(centres) {
  const byRegion = {};
  centres.forEach((c) => (byRegion[c.region] = byRegion[c.region] || []).push(c));
  const regions = Object.keys(byRegion).sort();
  const body = `
<nav class="crumbs"><a href="/">TestNow</a> › Test centres</nav>
<h1>Swap your driving test at any UK test centre</h1>
<p class="lede">Pick your DVSA practical test centre to see live tests nearby and list yours for a free swap. ${centres.length} centres across ${regions.length} regions.</p>
<a class="cta" href="/#swap-form">List my test — free</a>
${regions.map((r) => `<h2 id="${slug(r)}"><a href="/test-centres/${slug(r)}/" style="text-decoration:none;color:inherit;">${esc(r)}</a></h2><div class="grid">${byRegion[r].sort((a, b) => a.centre.localeCompare(b.centre)).map((c) => `<a href="/test-centres/${slug(c.centre)}.html">${esc(c.centre)}</a>`).join("")}</div>`).join("\n")}`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "TestNow", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: "Test centres", item: SITE + "/test-centres/" } ] }];
  return shell({ title: "Driving test swaps by test centre — every UK DVSA centre | TestNow", desc: `Find your DVSA driving test centre and swap your practical test date for free. ${centres.length} UK centres, live tests, anonymous matching.`, canonical: SITE + "/test-centres/", body, jsonld });
}

const centres = (await loadCentres()).filter((c) => c && c.centre && c.region);
// A few centres appear under two regions in the DVSA list (e.g. Grimsby Coldwater).
// One page per centre (first region wins); the index lists it under every region.
const bySlug = new Map();
for (const c of centres) if (!bySlug.has(slug(c.centre))) bySlug.set(slug(c.centre), c);
const REGIONS = [...new Set(centres.map((c) => c.region))].sort();
REGION_LINKS = REGIONS.map((r) => `<a href="/test-centres/${slug(r)}/">${esc(r)}</a>`).join("");
// previous sitemap lastmod + "did the bytes change" so an unchanged page keeps its old lastmod
const oldLastmod = new Map();
try { for (const m of fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) oldLastmod.set(m[1], m[2]); } catch {}
const unchanged = new Set();
const writeIfChanged = (file, html, url) => { let prev = null; try { prev = fs.readFileSync(file, "utf8"); } catch {} if (prev === html) unchanged.add(url); else fs.writeFileSync(file, html); };
fs.mkdirSync(OUT, { recursive: true });
for (const c of bySlug.values()) {
  const same = centres.filter((o) => o.region === c.region && o.centre !== c.centre)
    .filter((o, i, arr) => arr.findIndex((x) => x.centre === o.centre) === i)
    .sort((a, b) => a.centre.localeCompare(b.centre));
  const p = centrePage(c, bySlug, same);
  writeIfChanged(path.join(OUT, p.file), p.html, `${SITE}/test-centres/${p.file}`);
}
// drop pages for centres that no longer exist
const keep = new Set([...bySlug.keys()].map((k) => k + ".html").concat(["index.html"]));
for (const f of fs.readdirSync(OUT)) if (f.endsWith(".html") && !keep.has(f)) fs.unlinkSync(path.join(OUT, f));
writeIfChanged(path.join(OUT, "index.html"), indexPage(centres), SITE + "/test-centres/");
for (const r of REGIONS) {
  const list = centres.filter((c) => c.region === r).filter((o, i, arr) => arr.findIndex((x) => x.centre === o.centre) === i);
  const rp = regionPage(r, list, REGIONS);
  fs.mkdirSync(path.join(OUT, rp.dir), { recursive: true });
  writeIfChanged(path.join(OUT, rp.dir, "index.html"), rp.html, `${SITE}/test-centres/${rp.dir}/`);
}

const core = ["/", "/find-instructor.html", "/instructors.html", "/privacy.html", "/terms.html", "/cookies.html", "/report-concern.html", "/test-centres/", "/test-availability.html", "/just-passed.html", "/guides/",
  "/guides/how-to-get-an-earlier-driving-test.html", "/guides/driving-test-cancellation-scams.html", "/guides/swap-driving-test-date.html",
  "/guides/driving-test-waiting-times.html", "/guides/change-driving-test-centre.html", "/guides/what-to-do-after-passing-your-driving-test.html"];
const today = new Date().toISOString().slice(0, 10);
const urls = core.map((u) => SITE + u).concat(REGIONS.map((r) => `${SITE}/test-centres/${slug(r)}/`)).concat([...bySlug.keys()].map((k) => `${SITE}/test-centres/${k}.html`));
const lastmodFor = (u) => (unchanged.has(u) && oldLastmod.get(u)) ? oldLastmod.get(u) : today;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${lastmodFor(u)}</lastmod>\n  </url>`).join("\n") + "\n</urlset>\n");
console.log(`built ${bySlug.size} centre pages + index; sitemap has ${urls.length} urls`);
