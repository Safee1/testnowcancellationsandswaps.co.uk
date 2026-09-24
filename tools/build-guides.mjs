// Builds /guides/ — an index plus 6 SEO guide pages aimed at free search
// traffic. Static HTML, same visual style as just-passed.html. Re-run after
// editing GUIDES below. Does NOT touch sitemap.xml — run
// tools/build-centre-pages.mjs afterwards to regenerate it (it lists /guides/
// and each guide URL in its "core" array).
//
// Run: node tools/build-guides.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SITE = "https://testnowcancellationsandswaps.co.uk";
const OUT = path.join(ROOT, "guides");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

const STYLE = `<style>
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
  h3 { font-size:17px; margin:18px 0 4px; }
  p.lede { font-size:18px; color:#24372c; }
  p, ul, ol { margin-bottom:12px; }
  ul, ol { padding-left:20px; }
  li { margin:5px 0; }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:16px 18px; margin:14px 0; }
  .card.warm { background:var(--paper-warm); }
  .note { font-size:13px; color:var(--muted); }
  .cta { display:inline-block; background:var(--accent); color:#fff; font-weight:600; text-decoration:none; padding:14px 22px; border-radius:12px; margin:8px 8px 8px 0; min-height:44px; }
  .cta.ghost { background:transparent; color:var(--ink); border:1.5px solid var(--ink); }
  details { background:#fff; border:1px solid var(--line); border-radius:12px; padding:12px 14px; margin:8px 0; }
  summary { font-weight:600; cursor:pointer; }
  table { width:100%; border-collapse:collapse; font-size:15px; margin:10px 0; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-weight:600; color:var(--ink); }
  .grid { columns:2 220px; column-gap:24px; } .grid a { display:block; padding:4px 0; break-inside:avoid; }
  footer { margin:40px 0 0; padding:24px 0 40px; border-top:1px solid var(--line); font-size:13px; color:var(--muted); }
  footer a { color:var(--muted); margin-right:12px; }
</style>`;

function shell({ title, desc, slug, body, jsonld, ogTitle, ogDesc }) {
  const url = slug ? `${SITE}/guides/${slug}.html` : `${SITE}/guides/`;
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
${HEAD_TRACKING}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="TestNow Cancellations &amp; Swaps">
<meta property="og:title" content="${esc(ogTitle || title)}">
<meta property="og:description" content="${esc(ogDesc || desc)}">
<meta property="og:url" content="${url}">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
${STYLE}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>
<body>
<header class="top"><div class="wrap"><a class="home" href="/">TestNow</a><a href="/#swap-form">Swap a test — free</a></div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">
  <p>TestNow is a free, independent service for UK learner drivers. It is not DVSA and has no official DVSA endorsement. General information only, correct to the best of our knowledge on the date published — always check gov.uk for the current rules.</p>
  <p style="margin-top:10px;"><a href="/">Home</a><a href="/test-centres/">All test centres</a><a href="/guides/">Guides</a><a href="/find-instructor.html">Find an instructor</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/report-concern.html">Report a concern</a></p>
</div></footer>
</body>
</html>
`;
}

function breadcrumb(name, url) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "TestNow", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: SITE + "/guides/" },
    { "@type": "ListItem", position: 3, name, item: url },
  ] };
}

function article(title, desc, url, datePublished) {
  return { "@context": "https://schema.org", "@type": "Article", headline: title, description: desc,
    author: { "@type": "Organization", name: "TestNow" }, publisher: { "@type": "Organization", name: "TestNow" },
    datePublished, dateModified: datePublished, mainEntityOfPage: url };
}

function faqLd(faq) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
}

const DATE = "2026-09-24";

const GUIDES = [
  {
    slug: "how-to-get-an-earlier-driving-test",
    nav: "Get an earlier test",
    title: "How to get an earlier driving test in the UK (legit methods) | TestNow",
    desc: "Every legal way to bring your DVSA practical test date forward: DVSA's own cancellation checker, changing test centre, phoning DVSA, and swapping with another learner. Plus how to spot the paid bots and resellers to avoid.",
    h1: "How to get an earlier driving test",
    lede: "Six-month waits are common at busy centres. Here's every legitimate way to move your test forward — and which shortcuts are actually a DVSA rule-break or a scam.",
    body: `
<h2>1. Check DVSA's own cancellation list first</h2>
<p>When you book or manage your test on <a href="https://www.gov.uk/change-driving-test" target="_blank" rel="noopener">gov.uk</a>, the booking service shows any earlier slots that have opened up as other learners cancel or move theirs. This is DVSA's own tool, it's free, and it's the first thing to check — often several times a week, since cancellations appear at random.</p>
<div class="card warm"><b>Log in with:</b> your driving licence number and theory test pass certificate number (or your existing test booking reference if you already have a test booked).</div>

<h2>2. Widen the test centres you'll accept</h2>
<p>Since 9 June 2026, DVSA only lets you move a booked test to one of the <b>three nearest test centres</b> to your original one — so check what your three nearest actually are, and whether any of them tend to run shorter. Our <a href="/test-centres/">test centre pages</a> list neighbouring centres and typical wait signals for each. See our guide on <a href="/guides/change-driving-test-centre.html">changing your test centre</a> for the trade-offs.</p>

<h2>3. Change your date through gov.uk, not a middleman</h2>
<p>You can change your own test date directly on gov.uk, free, as long as you give DVSA at least <b>three working days'</b> notice and you're within your remaining change limit (two changes are currently allowed on a booking before you have to cancel and rebook from scratch). Do this yourself — never hand your licence number and payment details to a paid "test finder" site to do it for you.</p>

<h2>4. Swap with another learner going the other way</h2>
<p>If someone else has an earlier test they don't want and would happily take your later date, DVSA can swap you over the phone on <b>0300 200 1122</b> (option 2, Mon–Fri, 8am–5pm) — as long as you're both booked for the same type of test and your centres meet DVSA's location rule. The hard part is finding that other learner. That's what TestNow is for: it's a free board where learners post the test they have and what they'd swap it for, and matches you automatically.</p>
<a class="cta" href="/#swap-form">List your test — free</a>
<p class="note">Full step-by-step: <a href="/guides/swap-driving-test-date.html">how a learner-to-learner swap works</a>.</p>

<h2>5. Ask your instructor</h2>
<p>Instructors can't request or complete a swap or change on your behalf — only you can, by phone or on gov.uk — but a good instructor often knows which local centres tend to have shorter waits, and can help you decide whether it's worth moving.</p>

<h2>Avoid: paid "book me an earlier test" bots and resellers</h2>
<p>Since 12 May 2026, DVSA has cracked down on unofficial third-party booking services — only the learner can book and manage their own test. Sites and bots that promise to grab you an earlier slot for a fee are, at best, running automated refreshes against the same free tool you can use yourself, and at worst are collecting your licence details for fraud. Nobody can sell you a DVSA test date; if a "date" changes hands for money, it isn't a genuine DVSA booking.</p>
<div class="card"><b>Rule of thumb:</b> anything that asks you to pay a stranger, or hand over your driving licence number and card details to a site that isn't gov.uk, to get an earlier test — don't. Read <a href="/guides/driving-test-cancellation-scams.html">how these scams work</a> and how to report one.</p></div>

<h2>Quick checklist</h2>
<ol class="steps">
  <li>Check gov.uk's own cancellation list regularly (free).</li>
  <li>Check your three nearest centres for shorter waits.</li>
  <li>Change your date yourself on gov.uk, at least 3 working days ahead.</li>
  <li>List your test on TestNow and see if another learner wants to swap.</li>
  <li>Never pay anyone for a test date — DVSA is the only place a booking is made.</li>
</ol>
`,
    faq: [
      ["Is it actually legal to swap driving tests with a stranger?", "Yes. DVSA allows two learners to exchange booked test appointments over the phone, as long as both hold a live booking for the same type of test and confirm the swap themselves when DVSA calls them. Nobody is buying or selling anything — DVSA moves both bookings directly."],
      ["Can a driving instructor get me an earlier test?", "No. Only the learner can request a change or a swap — DVSA won't action one from an instructor. An instructor can help you decide which centres or dates to try, but the call to DVSA has to come from you."],
      ["Do paid 'test finder' bots actually work?", "They automate the same free cancellation checker anyone can use on gov.uk. Since DVSA's May 2026 crackdown on unofficial booking services, using one also risks your licence and payment details being handled by a site with no DVSA relationship."],
      ["How often should I check for a cancellation?", "There's no fixed schedule — cancellations appear at random as other learners change or cancel. Checking a few times a week, especially early morning, tends to catch more than checking once."],
    ],
  },
  {
    slug: "driving-test-cancellation-scams",
    nav: "Spot a scam",
    title: "Driving test cancellation scams: how they work and how to report them | TestNow",
    desc: "Nobody can legally sell you a DVSA driving test date. How cancellation-selling and fake 'test finder' scams work, the red flags, and how to report one to Action Fraud and DVSA.",
    h1: "Driving test cancellation scams — what to watch for",
    lede: "If someone is offering to sell you a driving test date, it isn't a real DVSA booking. Here's how the scam works and what to do if you've been targeted.",
    body: `
<h2>The one fact that ends most of these scams</h2>
<p>A DVSA practical test booking is tied to the learner who booked it — their name, licence number and theory pass certificate. It can only be changed or swapped by DVSA itself, over the phone, with both learners confirming it directly. <b>Nobody else can hand you a test date, sell you one, or "release" one to you for a fee.</b> If a date changes hands for money outside that DVSA phone call, whatever you've bought isn't a genuine booking.</p>

<h2>How the scam usually works</h2>
<ul>
  <li><b>Fake availability.</b> A social media account, bot account, or website claims to have found you an earlier test and asks for payment upfront "to secure it."</li>
  <li><b>Licence-detail phishing.</b> You're asked for your driving licence number, theory pass certificate number, date of birth and card details on a site that isn't gov.uk — sold as necessary to "book on your behalf."</li>
  <li><b>Automated bots.</b> Some services run software that hammers the official cancellation checker faster than a person can and resell the slots it finds, charging learners who are desperate to move their date. Since May 2026, DVSA has explicitly banned this kind of third-party booking activity — only the learner can book or manage their own test.</li>
  <li><b>Take the money, vanish.</b> In the worst cases, no test ever existed. You've simply paid a stranger and received nothing.</li>
</ul>

<h2>Red flags</h2>
<div class="card warm">
  <ul>
    <li>Anyone asking for payment to "get you" or "hold" a test date.</li>
    <li>Pressure to act immediately ("only available for the next 10 minutes").</li>
    <li>A request for your full licence number and theory pass number before you've agreed anything.</li>
    <li>Contact through unofficial channels — random DMs, WhatsApp groups, Facebook Marketplace listings for "driving test slots".</li>
    <li>A website that isn't gov.uk asking you to log in with your driving licence details.</li>
  </ul>
</div>

<h2>What's actually legal</h2>
<p>Two learners can swap their own already-booked tests, for free, by phoning DVSA together on the line — see our <a href="/guides/swap-driving-test-date.html">step-by-step swap guide</a>. TestNow exists to help you find that other learner; we never touch your DVSA account, never charge you, and the swap itself only ever happens when one of you calls DVSA directly on 0300 200 1122.</p>
<a class="cta" href="/#swap-form">Find a free, legitimate swap</a>

<h2>How to report a scam</h2>
<ol class="steps">
  <li><b>Action Fraud</b> — the UK's national reporting centre for fraud and cyber crime: <a href="https://www.actionfraud.police.uk/" target="_blank" rel="noopener">actionfraud.police.uk</a> or 0300 123 2040.</li>
  <li><b>DVSA</b> — report unofficial booking services or suspected fraud directly to DVSA via <a href="https://www.gov.uk/contact-dvsa" target="_blank" rel="noopener">gov.uk/contact-dvsa</a>.</li>
  <li><b>The platform it happened on</b> — report the account or listing to Facebook, Instagram, TikTok or WhatsApp so others don't fall for the same one.</li>
  <li>If you've shared card details, contact your bank immediately to flag the transaction.</li>
</ol>
<div class="card"><b>On TestNow specifically:</b> if anyone in a TestNow chat asks you for money, a phone number, or your licence details outside the DVSA call itself, use the <b>Report</b> button in the chat. We remove contact details automatically and investigate every report.</div>
`,
    faq: [
      ["Can someone legally sell me their driving test slot?", "No. A DVSA test booking belongs to the learner who booked it and can only be moved by DVSA itself, with both people confirming by phone. Any exchange of money for a 'slot' outside that process is not a real transfer and is very likely a scam."],
      ["Is it a scam if a website says it can book me an earlier test for a fee?", "Since DVSA's May 2026 rules, only the learner can book or manage their own driving test — third-party booking services are explicitly against DVSA's terms. A paid site offering to do this for you is, at minimum, breaking those rules, and often has no real access to your booking at all."],
      ["I've already paid someone for a test date — what should I do?", "Contact your bank straightaway to see if the payment can be recovered or disputed, then report it to Action Fraud (actionfraud.police.uk or 0300 123 2040) and to DVSA via gov.uk/contact-dvsa."],
      ["How is TestNow different from a scam 'test finder'?", "TestNow never charges learners, never handles payments, and never touches your DVSA account. It's a board where learners list the test they have and find another learner to swap with — the swap itself always happens on a direct call to DVSA, with both of you confirming it yourselves."],
    ],
  },
  {
    slug: "swap-driving-test-date",
    nav: "How a swap works",
    title: "How to swap your driving test date with another learner | TestNow",
    desc: "Step-by-step: how a DVSA learner-to-learner test swap actually works, what you need before you call, and what TestNow does (and doesn't do) to help you find a match.",
    h1: "How to swap your driving test date",
    lede: "Two learners, two dates, one phone call to DVSA. Here's exactly how a test swap works, what you need ready, and where TestNow fits in.",
    body: `
<h2>What a swap actually is</h2>
<p>A driving test swap is DVSA exchanging two already-booked practical test appointments between two learners — you take their date and centre, they take yours. DVSA carries out the exchange itself over the phone; nothing changes hands online, by email or by text.</p>

<h2>What you need before you're ready to swap</h2>
<div class="card">
  <ul>
    <li>A live DVSA practical test booking of your own (a swap exchanges two existing bookings — it can't create a new one).</li>
    <li>Your booking reference number.</li>
    <li>The same type of test as the learner you're swapping with (car for car, motorcycle for motorcycle, and so on).</li>
    <li>A centre that satisfies DVSA's location rule for the swap.</li>
    <li>A learner who wants your date and centre, and has one you want.</li>
  </ul>
</div>

<h2>Step by step</h2>
<ol class="steps">
  <li><b>Find a match.</b> This is the hard part done alone — you need someone with a test they don't want who'd happily take yours. <a href="/#swap-form">List your test on TestNow</a> and we match you automatically with learners who fit, or browse the <a href="/#board">live board</a> and request a swap directly.</li>
  <li><b>Agree the exact details.</b> Confirm the precise date, time and centre each of you is taking on, in a chat where neither of you sees the other's real name or phone number.</li>
  <li><b>One of you calls DVSA.</b> Phone <b>0300 200 1122</b> and choose option 2 (Monday–Friday, 8am–5pm). Swaps can't be requested online, by email, webchat or text — it has to be this call, and DVSA generally asks for at least 10 full working days' notice before the earlier of the two tests.</li>
  <li><b>DVSA verifies you both.</b> The DVSA agent runs security checks with the caller, then puts them on hold and rings the other learner on the number held against their booking to confirm they agree too.</li>
  <li><b>DVSA moves both bookings.</b> Once you've both confirmed, DVSA updates both appointments during that same call. There's no separate confirmation email — your next DVSA reminder will show the new details.</li>
</ol>

<h2>What TestNow does — and doesn't do</h2>
<div class="card warm">
  <p><b>We do:</b> match you anonymously with another learner who wants what you have, strip out phone numbers and contact details from chat messages automatically, and it's completely free.</p>
  <p><b>We don't:</b> log in to your DVSA account, hold your licence details, make the phone call for you, charge you anything, or guarantee a match — you still need to find someone whose date and centre work for you both.</p>
</div>
<a class="cta" href="/#swap-form">List my test — free</a>
<a class="cta ghost" href="/test-centres/">Browse tests by centre</a>

<h2>If you can't find a match right away</h2>
<p>Match speed depends on how many other learners near your centre also want to swap. Being flexible about which of your three nearest centres you'd accept — see <a href="/guides/change-driving-test-centre.html">changing your test centre</a> — widens your options considerably. You can also check DVSA's own cancellation list on gov.uk in parallel; see our guide to <a href="/guides/how-to-get-an-earlier-driving-test.html">getting an earlier test</a> for every legitimate route.</p>
`,
    faq: [
      ["Do I need my licence number to swap?", "You'll need your booking reference and DVSA will verify your identity on the call, in line with their standard security checks — have your licence details to hand in case they're asked for."],
      ["How much notice does DVSA need for a swap?", "DVSA generally asks for the request to reach them at least 10 full working days before the earlier of the two tests, so agree your swap with plenty of time to spare."],
      ["Can I swap a car test for a motorcycle test?", "No. Both bookings need to be for the same type of test."],
      ["Does TestNow charge for a swap?", "No. Listing your test, matching and chatting with another learner is completely free. The swap itself is a normal DVSA phone call — DVSA doesn't charge for it either."],
    ],
  },
  {
    slug: "driving-test-waiting-times",
    nav: "Waiting times",
    title: "UK driving test waiting times explained | TestNow",
    desc: "Why DVSA practical test waiting times vary so much by centre, where to check the official figures, and how to see live tests listed near you right now.",
    h1: "Driving test waiting times, explained",
    lede: "Waits of several months are common at busy UK test centres. Here's why, where the official figures live, and how to see what's actually available near you today.",
    body: `
<h2>Why waits vary so much by centre</h2>
<p>DVSA's practical test waiting times depend on examiner capacity at each individual centre versus local demand — busy urban centres in big cities often have longer average waits than smaller or rural ones nearby, sometimes by months, even a short drive apart. Waits also shift over the year as demand and staffing change, so a centre that's quiet this month may not be next month.</p>

<h2>Where to check the official figures</h2>
<p>DVSA publishes driving test waiting times by test centre as an official dataset on gov.uk. Because these figures are updated periodically by DVSA rather than in real time, always check the current release on gov.uk directly rather than relying on an old screenshot or a third-party summary:</p>
<div class="card"><a href="https://www.gov.uk/government/statistics/driving-test-statistics-drt" target="_blank" rel="noopener">gov.uk — Driving test statistics (DRT)</a> — DVSA's official waiting time and pass rate data by test centre.</div>

<h2>TestNow's board isn't the official figures — here's what it is</h2>
<p>Our <a href="/test-availability.html">live test availability page</a> and <a href="/test-centres/">test centre pages</a> show tests that learners have actually listed on TestNow, looking to swap — not DVSA's booking system and not an official wait-time measure. Think of it as a live snapshot of who's currently looking to move their date at each centre, useful alongside the official DVSA figures, not instead of them.</p>
<a class="cta" href="/test-availability.html">See live tests by centre</a>
<a class="cta ghost" href="/test-centres/">Browse all test centres</a>

<h2>What actually shortens your wait</h2>
<ul>
  <li><b>Check DVSA's cancellation list</b> regularly on gov.uk — cancelled slots appear at random as other learners change or cancel their own tests.</li>
  <li><b>Widen your accepted centres.</b> Since 9 June 2026, DVSA only lets you move a test to one of your three nearest centres, so it's worth knowing which three that actually is — see <a href="/guides/change-driving-test-centre.html">changing your test centre</a>.</li>
  <li><b>Swap with another learner</b> going the opposite direction to you — see <a href="/guides/swap-driving-test-date.html">how a swap works</a>.</li>
</ul>
<p class="note">Full rundown of every legitimate option: <a href="/guides/how-to-get-an-earlier-driving-test.html">how to get an earlier driving test</a>.</p>
`,
    faq: [
      ["Where are the official DVSA waiting times published?", "DVSA publishes driving test statistics, including waiting times by test centre, on gov.uk under 'Driving test statistics (DRT)'. Always check the current release there rather than an old screenshot."],
      ["Is TestNow's board the same as DVSA's official waiting times?", "No. TestNow shows tests learners have listed on our board looking to swap — a live snapshot of demand, not DVSA's official waiting-time statistics or its booking system."],
      ["Why is one test centre so much busier than one nearby?", "Waits depend on each centre's examiner capacity against local demand, which can differ sharply even between centres a short drive apart, and can shift over time as staffing and demand change."],
      ["Does swapping actually get me a shorter wait?", "It can — if you find a learner who's booked earlier at a centre you'd accept and wants your later date instead, DVSA can swap you over the phone. It depends on finding a matching learner, which is what TestNow helps with."],
    ],
  },
  {
    slug: "change-driving-test-centre",
    nav: "Change your centre",
    title: "How to change your driving test centre | TestNow",
    desc: "How to change which DVSA test centre you're booked at, what the three-nearest-centre rule means since June 2026, and how to find a quieter centre nearby.",
    h1: "How to change your driving test centre",
    lede: "Moving your test to a different centre can mean an earlier date — but DVSA limits how far you can move. Here's how it works and how to pick well.",
    body: `
<h2>The rule you need to know</h2>
<p>Since 9 June 2026, once your test is booked, DVSA only lets you change it to one of the <b>three test centres nearest</b> to your original one — this was introduced to stop learners booking at far-flung centres with no intention of testing there. You can still choose freely when you first book; the restriction applies to changes after that.</p>

<h2>How to change centre</h2>
<ol class="steps">
  <li>Go to <a href="https://www.gov.uk/change-driving-test" target="_blank" rel="noopener">gov.uk/change-driving-test</a> and sign in with your licence number and booking reference.</li>
  <li>Choose one of your three nearest eligible centres.</li>
  <li>Pick from the available dates shown — this is also where DVSA's own cancellation slots appear.</li>
  <li>Confirm at least three working days before your current test, and within your remaining change limit (currently two changes before you'd need to cancel and rebook).</li>
</ol>

<h2>Pros and cons of moving centre</h2>
<div class="card">
  <p><b>Pros:</b> a nearby centre can have a shorter wait, meaning an earlier test; smaller centres sometimes run quieter than city-centre ones; you get to pick from whatever dates are currently open there.</p>
  <p><b>Cons:</b> a different centre means different roads, junctions and hazards to get used to — lessons in the actual test area help; you're limited to your three nearest, so options may be narrower than you'd like; each change uses up one of your limited changes on that booking.</p>
</div>

<h2>Finding a quieter centre nearby</h2>
<p>Our <a href="/test-centres/">test centre pages</a> list the centres DVSA treats as nearby to each other and show live tests learners have listed at each — a useful signal alongside DVSA's own <a href="/guides/driving-test-waiting-times.html">official waiting time figures</a> when deciding where to move.</p>
<a class="cta" href="/test-centres/">Browse test centres</a>

<h2>Another route: swap instead of change</h2>
<p>If a learner already booked at one of your nearby centres wants your date, and you want theirs, DVSA can swap you directly by phone rather than you hunting for an open slot yourself. See <a href="/guides/swap-driving-test-date.html">how a swap works</a>, or list your test and let TestNow find a match for you.</p>
<a class="cta" href="/#swap-form">List my test — free</a>
`,
    faq: [
      ["Can I move my test to any centre I like?", "Only when you first book. Once booked, DVSA limits changes to your three nearest test centres, a rule introduced on 9 June 2026."],
      ["How many times can I change my test centre or date?", "Two changes are currently allowed on a booking before you need to cancel it and rebook from scratch, and each change needs at least three working days' notice."],
      ["Will driving lessons at my old centre still help at the new one?", "The basics carry over, but book a lesson or two around your new test centre if you can — local junctions, roundabouts and typical routes vary and examiners test on real local roads."],
      ["Is changing centre the same as swapping?", "No. Changing centre means picking from whatever dates DVSA currently shows as available at an eligible nearby centre. Swapping means exchanging your exact date with another learner who wants it, arranged directly with DVSA by phone."],
    ],
  },
  {
    slug: "what-to-do-after-passing-your-driving-test",
    nav: "Just passed?",
    title: "What to do after passing your driving test | TestNow",
    desc: "Just passed your UK driving test? The essentials for your first week — licence, insurance, and what to do next.",
    h1: "What to do after passing your driving test",
    lede: "Congratulations. Here's the short version of what matters in the first week — the full detail, including what insurance actually costs, is one click away.",
    body: `
<h2>The essentials, fast</h2>
<ol class="steps">
  <li><b>Your licence.</b> If you handed in your provisional, your full licence arrives by post in about three weeks; if you kept it, you apply yourself. Either way, you can drive immediately using your pass certificate.</li>
  <li><b>Insurance before you drive.</b> A learner policy usually ends the moment you pass — check the car you're about to drive is actually insured for you as a full licence holder before you set off.</li>
  <li><b>Stay under 6 points for two years.</b> Under the New Drivers Act, reaching 6 penalty points within two years of passing revokes your licence and you're back to a provisional, retaking both tests.</li>
</ol>

<h2>The part that catches new drivers out: cost</h2>
<p>New-driver insurance is expensive because insurers have no claims history to price against — the car's insurance group, where it's parked overnight, your mileage and how you pay all move the price significantly. Our full guide breaks down each type of cover, what actually reduces the price, and what's worth doing in your first month.</p>
<a class="cta" href="/just-passed.html">Read the full first-week guide</a>

<h2>Still helping someone else get there?</h2>
<p>If a friend or family member is still waiting on their own test, they can swap their date with another learner for free — no fees, no middlemen, arranged properly through DVSA. See <a href="/guides/swap-driving-test-date.html">how a swap works</a>.</p>
<a class="cta ghost" href="/#swap-form">Swap a driving test — free</a>
`,
    faq: [
      ["Can I drive alone straight after passing?", "Yes, as soon as you pass you can drive unaccompanied — but only in a car that's actually insured for you to drive. Learner policies usually end the moment you pass, so check your cover first."],
      ["Why is insurance so expensive right after passing?", "Insurers price on claims history, and a newly qualified driver has none yet. The car's insurance group, where it's kept overnight, your mileage and how you pay all move the price — see the full guide for what actually helps."],
      ["What happens if I get 6 points in my first two years?", "Under the New Drivers Act, reaching 6 penalty points within two years of passing revokes your licence — you go back to a provisional and have to pass both tests again."],
      ["Do I need to do anything with DVLA myself?", "Only if you kept your provisional licence rather than handing it to the examiner — in that case you apply to DVLA yourself. If the examiner sent it off, your full licence just arrives by post."],
    ],
  },
];

function guideBody(g) {
  return `
<nav class="crumbs"><a href="/">TestNow</a> › <a href="/guides/">Guides</a> › ${esc(g.nav)}</nav>
<h1>${esc(g.h1)}</h1>
<p class="lede">${g.lede}</p>
${g.body}
<h2>Questions</h2>
${g.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p style="margin-top:8px;">${a}</p></details>`).join("\n")}
`;
}

function guidePage(g) {
  const url = `${SITE}/guides/${g.slug}.html`;
  const jsonld = [breadcrumb(g.nav, url), article(g.title, g.desc, url, DATE), faqLd(g.faq)];
  return shell({ title: g.title, desc: g.desc, slug: g.slug, body: guideBody(g), jsonld });
}

function indexPage() {
  const url = `${SITE}/guides/`;
  const body = `
<nav class="crumbs"><a href="/">TestNow</a> › Guides</nav>
<h1>Driving test guides</h1>
<p class="lede">Plain-English guides for UK learner drivers — getting an earlier test, avoiding scams, swapping your date, waiting times, changing centre, and what to do once you've passed.</p>
<div class="card">
${GUIDES.map((g) => `<p style="margin:10px 0;"><a href="/guides/${g.slug}.html"><b>${esc(g.nav === g.h1 ? g.h1 : g.h1)}</b></a><br><span class="note">${esc(g.desc.split(".")[0])}.</span></p>`).join("\n")}
</div>
<a class="cta" href="/#swap-form">List my test — free</a>
<a class="cta ghost" href="/test-centres/">Browse test centres</a>
`;
  const jsonld = [breadcrumb("Guides", url)];
  return shell({ title: "Driving test guides for UK learners | TestNow", desc: "Free, plain-English guides for UK learner drivers: getting an earlier test, avoiding cancellation scams, swapping your date, waiting times, changing test centre, and what to do after passing.", slug: "", body, jsonld });
}

fs.mkdirSync(OUT, { recursive: true });
for (const g of GUIDES) fs.writeFileSync(path.join(OUT, `${g.slug}.html`), guidePage(g));
fs.writeFileSync(path.join(OUT, "index.html"), indexPage());
console.log(`built ${GUIDES.length} guide pages + index in /guides/`);
