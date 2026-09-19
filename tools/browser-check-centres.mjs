// Real-browser check: serves the repo locally, opens a centre page, waits for
// the live tests to load from the production API, follows its "List my test"
// button to the homepage and confirms region + centre are pre-selected.
// Run: node tools/browser-check-centres.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
// Uses a local playwright if present, else the global @playwright/cli copy on this PC.
const req = createRequire(import.meta.url);
let pw;
try { pw = req("playwright"); } catch { pw = req(path.join(process.env.APPDATA || "", "npm/node_modules/@playwright/cli/node_modules/playwright")); }
const { chromium } = pw;

const ROOT = process.cwd();
const types = { ".html": "text/html", ".xml": "application/xml", ".jpg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon", ".txt": "text/plain" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}`;
// Falls back to any Chromium already downloaded on this PC if the bundled one is missing.
let browser;
try { browser = await chromium.launch(); } catch (e) {
  const dir = path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
  const cand = fs.existsSync(dir) ? fs.readdirSync(dir).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse() : [];
  const exe = cand.map((d) => path.join(dir, d, "chrome-win64", "chrome.exe")).find((p) => fs.existsSync(p));
  if (!exe) throw e;
  browser = await chromium.launch({ executablePath: exe });
}
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // phone-sized
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };

await page.goto(base + "/test-centres/wednesbury.html");
await page.waitForFunction(() => !document.getElementById("live").textContent.includes("Loading"), null, { timeout: 45000 });
const live = await page.textContent("#live");
ok(/at Wednesbury/.test(live) || /Be the first/.test(live), "centre page loads live tests: " + live.replace(/\s+/g, " ").slice(0, 90));
const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
ok(!hscroll, "no sideways scroll at phone width");

await page.goto(base + "/test-centres/");
ok((await page.$$("div.grid a")).length > 300, "index lists every centre");

await page.goto(base + "/test-centres/wednesbury.html");
const href = await page.getAttribute("a.cta", "href");
await page.goto(base + href);
await page.waitForFunction(() => { const s = document.getElementById("centre"); return s && s.value; }, null, { timeout: 45000 }).catch(() => {});
const region = await page.inputValue("#region").catch(() => "");
const centre = await page.inputValue("#centre").catch(() => "");
ok(region === "West Midlands" && centre === "Wednesbury", `homepage pre-filled (region="${region}", centre="${centre}")`);
ok(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.join(" | ") : ""));
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
