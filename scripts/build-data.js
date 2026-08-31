// Loads the existing web/data/*.js files (same ones catalog.html uses) inside a
// sandboxed Node vm context that mimics the browser global scope, then extracts
// the concatenated product arrays as real data (no fabricated content) into
// site/data/*.json for the new site to consume.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "web", "data");
const CATALOG_HTML = path.join(ROOT, "web", "catalog.html");
const OUT_DIR = path.join(__dirname, "..", "data");

// This script only works when run INSIDE the original project folder (the one
// with a sibling "web/" directory holding the master scraped data). That
// folder is intentionally NOT committed to this repo — site/data/*.json is
// already the built output. On a deploy target (e.g. Hostinger) "web/" won't
// exist, so skip instead of crashing the build.
if (!fs.existsSync(CATALOG_HTML)) {
  console.log(`build-data.js: "${CATALOG_HTML}" not found — skipping (this is expected on a`);
  console.log("deploy target; site/data/*.json already contains the built output; this script");
  console.log("is only meant to be run locally inside the original project folder).");
  process.exit(0);
}

const html = fs.readFileSync(CATALOG_HTML, "utf8");
const scriptFiles = [...html.matchAll(/<script src="data\/([^"]+)"><\/script>/g)].map(m => m[1]);

const sandbox = {};
sandbox.window = sandbox; // window.X === X, matches browser global scope
sandbox.console = console;
vm.createContext(sandbox);

for (const file of scriptFiles) {
  const code = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  vm.runInContext(code, sandbox, { filename: file });
}

function normalizeBrand(raw, brandId, catFallback) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map(p => ({
    slug: p.slug,
    name: p.name,
    model: p.mirkaCode || p.model || p.slug,
    brandId,
    subCategory: p.subCategory || catFallback || "",
    industries: p.industries || [],
    shortDesc: p.shortDesc || "",
    img: p.img || "",
    specs: p.specs || {},
    specConfidence: p.specConfidence || "verified",
  }));
}

const BRAND_META = [
  { id: "tonghop", name: "Tổng hợp", country: "—", category: "Đa dụng / nhiều hãng", color: "#2F7A4D", on: "#FFFFFF" },
  { id: "mirka", name: "Mirka", country: "Phần Lan", category: "Máy chà nhám", color: "#FDC100", on: "#141414" },
  { id: "devilbiss", name: "DeVilbiss", country: "Mỹ", category: "Súng phun sơn", color: "#C4300E", on: "#FFFFFF" },
  { id: "anestiwata", name: "Anest Iwata", country: "Nhật Bản", category: "Súng phun sơn", color: "#007C9C", on: "#FFFFFF" },
  { id: "dynabrade", name: "Dynabrade", country: "Mỹ", category: "Máy chà nhám khí nén", color: "#FF4712", on: "#FFFFFF" },
  { id: "binks", name: "Binks", country: "Mỹ", category: "Bơm & súng phun CN", color: "#0E3EA0", on: "#FFFFFF" },
  { id: "compact", name: "Compact Tools", country: "Nhật Bản", category: "Máy chà nhám khí nén", color: "#2D55AA", on: "#FFFFFF" },
  { id: "oem", name: "OEM", country: "Sản xuất tại Châu Âu", category: "Phụ kiện & linh kiện thay thế", color: "#4A5568", on: "#FFFFFF" },
  { id: "prona", name: "Prona", country: "Trung Quốc", category: "Súng phun sơn & dụng cụ khí nén", color: "#0170C1", on: "#FFFFFF" },
  { id: "wagner", name: "Wagner", country: "Đức", category: "Thiết bị phun sơn CN", color: "#FFCB00", on: "#141414" },
];

const ALL_PRODUCTS = []
  .concat(normalizeBrand(sandbox.MIRKA_PRODUCTS, "mirka"))
  .concat(normalizeBrand(sandbox.DEVILBISS_PRODUCTS, "devilbiss"))
  .concat(normalizeBrand(sandbox.ANESTIWATA_PRODUCTS, "anestiwata"))
  .concat(normalizeBrand(sandbox.WAGNER_PRODUCTS, "wagner"))
  .concat(normalizeBrand(sandbox.DYNABRADE_PRODUCTS, "dynabrade"))
  .concat(normalizeBrand(sandbox.BINKS_PRODUCTS, "binks"))
  .concat(normalizeBrand(sandbox.COMPACT_PRODUCTS, "compact"))
  .concat(normalizeBrand(sandbox.OEM_PRODUCTS, "oem"))
  .concat(normalizeBrand(sandbox.PRONA_PRODUCTS, "prona"))
  .concat(normalizeBrand(sandbox.TONGHOP_PRODUCTS, "tonghop"));

const brandsWithCounts = BRAND_META.map(b => ({
  ...b,
  count: ALL_PRODUCTS.filter(p => p.brandId === b.id).length,
})).filter(b => b.count > 0);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "products.json"), JSON.stringify(ALL_PRODUCTS));
fs.writeFileSync(path.join(OUT_DIR, "brands.json"), JSON.stringify(brandsWithCounts, null, 2));

console.log(`Built ${ALL_PRODUCTS.length} products across ${brandsWithCounts.length} brands.`);
brandsWithCounts.forEach(b => console.log(`  ${b.name}: ${b.count}`));
