// Picks real featured products (one per brand where possible, verified specs, has image)
// so the homepage never shows fabricated products — only genuine catalog items.
const fs = require("fs");
const path = require("path");

const products = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "products.json"), "utf8"));
const brands = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "brands.json"), "utf8"));

// binks.com's CDN blocks hotlinking for some product images (pre-existing data issue,
// not specific to this product) — skip known-bad hosts so featured products always render.
const BLOCKED_IMG_HOSTS = ["binks.com"];
function hasWorkingHost(url) {
  try { return !BLOCKED_IMG_HOSTS.some(h => new URL(url).hostname.includes(h)); }
  catch { return false; }
}

const featured = [];
for (const b of brands) {
  if (b.id === "tonghop" || b.id === "oem") continue; // prefer named-brand hero products
  const candidate = products.find(p => p.brandId === b.id && p.img && hasWorkingHost(p.img) && p.specConfidence === "verified");
  if (candidate) featured.push(candidate);
}
// cap to 8 for a clean grid
const picked = featured.slice(0, 8);
fs.writeFileSync(path.join(__dirname, "..", "data", "featured.json"), JSON.stringify(picked, null, 2));
console.log(`Picked ${picked.length} featured products:`);
picked.forEach(p => console.log(`  [${p.brandId}] ${p.name}`));
