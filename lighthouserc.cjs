const fs = require("node:fs");

function normalize(url) {
  return String(url || "").replace(/\/$/, "");
}

function loadUrls() {
  try {
    const selectedRaw = fs.readFileSync("quality/reports/selected-urls.json", "utf8");
    const selected = JSON.parse(selectedRaw);
    if (Array.isArray(selected.urls) && selected.urls.length > 0) {
      return selected.urls;
    }
  } catch {
    // fallback below
  }

  const targetsRaw = fs.readFileSync("quality/targets.json", "utf8");
  const targets = JSON.parse(targetsRaw);
  const baseUrl = normalize(
    process.env.QUALITY_BASE_URL_OVERRIDE ||
      (process.env.QUALITY_MODE === "pr" && targets.baseUrlPreview ? targets.baseUrlPreview : "") ||
      targets.baseUrlProd,
  );

  if (!baseUrl) {
    return [];
  }

  return (targets.pathsCriticos || []).map((path) => `${baseUrl}${String(path).startsWith("/") ? "" : "/"}${path}`);
}

const profile = process.env.QUALITY_MODE === "nightly" || process.env.QUALITY_MODE === "prod" ? "nightly" : "pr";
const minScores =
  profile === "nightly"
    ? {
        performance: 0.72,
        accessibility: 0.9,
        "best-practices": 0.88,
        seo: 0.9,
      }
    : {
        performance: 0.55,
        accessibility: 0.82,
        "best-practices": 0.78,
        seo: 0.82,
      };

module.exports = {
  ci: {
    collect: {
      url: loadUrls(),
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: minScores.performance }],
        "categories:accessibility": ["warn", { minScore: minScores.accessibility }],
        "categories:best-practices": ["warn", { minScore: minScores["best-practices"] }],
        "categories:seo": ["warn", { minScore: minScores.seo }],
        "resource-summary:script:size": ["warn", { maxNumericValue: 450000 }],
        "resource-summary:image:size": ["warn", { maxNumericValue: 900000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "quality/reports/lighthouse",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%",
    },
  },
};
