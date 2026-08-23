import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = process.cwd();
const kib = 1024;

const routeBudgets = [
  ["/o", ".next/server/app/o/page_client-reference-manifest.js", 112 * kib],
  ["/courses", ".next/server/app/courses/page_client-reference-manifest.js", 100 * kib],
  [
    "/learning-fit",
    ".next/server/app/learning-fit/page_client-reference-manifest.js",
    38 * kib,
  ],
  [
    "/guides",
    ".next/server/app/guides/page_client-reference-manifest.js",
    32 * kib,
  ],
  [
    "/workspace/company",
    ".next/server/app/workspace/company/page_client-reference-manifest.js",
    85 * kib,
  ],
  [
    "/auth/sign-in",
    ".next/server/app/auth/sign-in/page_client-reference-manifest.js",
    40 * kib,
  ],
  [
    "/platform",
    ".next/server/app/platform/page_client-reference-manifest.js",
    140 * kib,
  ],
  [
    "/ai/homemade/atlas",
    ".next/server/app/ai/homemade/atlas/page_client-reference-manifest.js",
    105 * kib,
  ],
];

const assetBudgets = [
  ["favicon", "src/app/favicon.ico", 32 * kib],
  ["hero poster", "public/images/hero-poster.jpg", 100 * kib],
  ["hero preview", "public/videos/promo-preview.mp4", 800 * kib],
];

function formatKib(bytes) {
  return `${(bytes / kib).toFixed(1)} KiB`;
}

function readRouteGzipSize(manifestPath) {
  const absoluteManifestPath = path.join(root, manifestPath);
  if (!fs.existsSync(absoluteManifestPath)) {
    throw new Error(`Missing ${manifestPath}; run npm run build first.`);
  }

  const context = {};
  vm.runInNewContext(fs.readFileSync(absoluteManifestPath, "utf8"), context);
  const manifest = Object.values(context.__RSC_MANIFEST ?? {})[0];

  if (!manifest?.clientModules) {
    throw new Error(`Invalid client reference manifest: ${manifestPath}`);
  }

  const chunks = new Set(
    Object.values(manifest.clientModules)
      .flatMap((module) => module.chunks ?? [])
      .filter((chunk) => chunk.endsWith(".js")),
  );

  return [...chunks].reduce((total, chunk) => {
    const chunkPath = path.join(
      root,
      ".next",
      chunk.replace(/^\/_next\//, ""),
    );
    return total + zlib.gzipSync(fs.readFileSync(chunkPath)).byteLength;
  }, 0);
}

let failed = false;

console.log("Initial client JavaScript (gzip)");
for (const [route, manifestPath, budget] of routeBudgets) {
  const actual = readRouteGzipSize(manifestPath);
  const withinBudget = actual <= budget;
  failed ||= !withinBudget;
  console.log(
    `${withinBudget ? "PASS" : "FAIL"} ${route}: ${formatKib(actual)} / ${formatKib(budget)}`,
  );
}

console.log("\nCritical asset sizes");
for (const [label, assetPath, budget] of assetBudgets) {
  const actual = fs.statSync(path.join(root, assetPath)).size;
  const withinBudget = actual <= budget;
  failed ||= !withinBudget;
  console.log(
    `${withinBudget ? "PASS" : "FAIL"} ${label}: ${formatKib(actual)} / ${formatKib(budget)}`,
  );
}

if (failed) {
  process.exitCode = 1;
}
