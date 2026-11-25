// Shared first-touch source attribution — runs on EVERY public page so a
// visitor landing on /guides/*, /test-centres/*, /test-availability.html,
// /just-passed.html etc with UTM/gclid/click-id params gets recorded even if
// they click through to the homepage (or anywhere else) before submitting.
// First-touch wins: once a source is computed for this session it is never
// overwritten, so later page views with no query string keep the original
// ads/utm/organic source instead of falling back to direct.
(function () {
  function sanitise(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9:._-]/g, '').slice(0, 60);
  }

  var existing = '';
  try { existing = sessionStorage.getItem('tn_source') || ''; } catch (e) {}
  if (existing) return;

  // Fall back to a still-valid (<30 day) localStorage value from an earlier
  // session before computing fresh, so cross-session first-touch survives a
  // session boundary too — but a fresh session-level value always wins if
  // this page load itself carries new params (handled below).
  var lsValue = '';
  try {
    var raw = localStorage.getItem('tn_source_ls');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v && parsed.t && (Date.now() - parsed.t) < 30 * 24 * 60 * 60 * 1000) {
        lsValue = parsed.v;
      }
    }
  } catch (e) {}

  var computed = null;
  try {
    var params = new URLSearchParams(location.search);
    var gclid = params.get('gclid');
    var fbclid = params.get('fbclid');
    var ttclid = params.get('ttclid');
    var scCid = params.get('ScCid') || params.get('sccid');
    var msclkid = params.get('msclkid');
    var rdtCid = params.get('rdt_cid');
    var utmSource = params.get('utm_source');
    var utmMedium = (params.get('utm_medium') || '').toLowerCase();
    var utmCampaign = params.get('utm_campaign');

    var paidMedium = ['cpc', 'ppc', 'paid', 'paidsocial'].indexOf(utmMedium) !== -1;

    if (gclid || (paidMedium && (!utmSource || utmSource === 'google'))) {
      computed = 'ads:' + (utmCampaign ? 'google:' + utmCampaign : 'google');
    } else if (fbclid) {
      computed = 'ads:meta';
    } else if (ttclid) {
      computed = 'ads:tiktok';
    } else if (scCid) {
      computed = 'ads:snap';
    } else if (msclkid) {
      computed = 'ads:bing';
    } else if (rdtCid) {
      computed = 'ads:reddit';
    } else if (paidMedium) {
      computed = 'ads:' + (utmSource || 'unknown') + (utmCampaign ? ':' + utmCampaign : '');
    } else if (utmSource) {
      computed = 'utm:' + utmSource;
    } else if (document.referrer) {
      var refHost = new URL(document.referrer).hostname;
      if (refHost && refHost !== location.hostname) {
        computed = 'organic:' + refHost;
      }
    }
  } catch (e) {}

  if (!computed) computed = lsValue || 'direct';
  computed = sanitise(computed) || 'direct';

  try { sessionStorage.setItem('tn_source', computed); } catch (e) {}
  if (computed !== 'direct') {
    try { localStorage.setItem('tn_source_ls', JSON.stringify({ v: computed, t: Date.now() })); } catch (e) {}
  }
})();

// Meta pixel (18 Nov 2026). Loads ONLY after the visitor accepts on the cookie
// banner (tn_consent_v2=yes), and never on private pages whose address carries
// a personal link (chat, enquiry replies, remove, add-email, review, pass follow-up).
(function () {
  var PIXEL_ID = '1642464853933807';
  var PRIVATE = /^\/(chat|enquiry-respond|add-email|remove|review|pass-followup|report-concern|instructor)(\.html)?\/?$/i;
  var loaded = false;
  function consented() {
    try { return /(^|;)\s*tn_consent_v2\s*=\s*yes(;|$)/.test(document.cookie); } catch (e) { return false; }
  }
  function load() {
    if (loaded || PRIVATE.test(location.pathname) || /[?&](tk|token)=/i.test(location.search) || !consented()) return; // v172: instructor dashboard + any URL carrying a personal token never reaches Meta
    loaded = true;
    try {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', PIXEL_ID);
      fbq('track', 'PageView');
    } catch (e) {}
  }
  window.tnMetaPixel = load;
  load();
  // The banner sets the cookie on a click; pick that up without editing every page.
  try {
    document.addEventListener('click', function () { if (!loaded) setTimeout(load, 80); }, true);
  } catch (e) {}
})();
