// Static checks for the site: every inline script parses, every JSON-LD block
// is valid JSON, and every /test-centres/ link points at a file that exists.
// Run: node tools/check-site.mjs
import fs from "node:fs";
let bad = 0;
const files = ["index.html", "chat.html", "test-availability.html", ...fs.readdirSync("test-centres").map((f) => "test-centres/" + f)];
for (const f of files) {
  const p = fs.readFileSync(f, "utf8");
  for (const m of p.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    try { new Function(m[1]); } catch (e) { bad++; console.log("SCRIPT", f, e.message); }
  }
  for (const m of p.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { bad++; console.log("JSON-LD", f, e.message); }
  }
  for (const m of p.matchAll(/href="\/?test-centres\/([^"#]*)/g)) {
    const t = m[1] || "index.html";
    if (!fs.existsSync("test-centres/" + t)) { bad++; console.log("LINK", f, "->", t); }
  }
}
const pages = fs.readdirSync("test-centres").filter((f) => f.endsWith(".html"));
const sm = fs.readFileSync("sitemap.xml", "utf8");
const inSitemap = (sm.match(/<loc>/g) || []).length;
const footer = (fs.readFileSync("index.html", "utf8").match(/Swaps by test centre/g) || []).length;
console.log(`${files.length} files checked, ${bad} problems | ${pages.length} centre pages | sitemap ${inSitemap} urls | homepage footer link x${footer}`);
process.exit(bad || footer !== 1 ? 1 : 0);
