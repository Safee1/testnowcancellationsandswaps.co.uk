// Refreshes assets/centres.json (served statically by GitHub Pages so the homepage
// form does not wait on Apps Script). Run after the centre list changes:
//   node tools/refresh-centres-asset.mjs
import fs from "node:fs";
const U = "https://script.google.com/macros/s/AKfycbxpAa2f8VaJvKwQspRz0QEsp9KZIB_7ZIkMwskYPl2zjLgtsqoi8l_PqpvrtpQ7c2JO/exec?action=centres";
const d = await (await fetch(U, { redirect: "follow" })).json();
if (d.result !== "success" || !Array.isArray(d.centres) || d.centres.length < 300) throw new Error("unexpected centres payload");
fs.writeFileSync("assets/centres.json", JSON.stringify(d));
console.log("wrote assets/centres.json with", d.centres.length, "centres");
