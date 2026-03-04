import { writeFile } from "node:fs/promises";
import {
  ensureDir,
  loadTargets,
  modeToProfile,
  parseArgs,
  toAbsoluteUrl,
  writeJson,
} from "./quality/common.mjs";
import { collectSitemapUrls } from "./fetch_sitemap_urls.mjs";

function pickBaseUrl({ mode, targets, overrideBaseUrl }) {
  if (overrideBaseUrl) return overrideBaseUrl;
  if (mode === "pr" && targets.baseUrlPreview) return targets.baseUrlPreview;
  return targets.baseUrlProd;
}

function deterministicSample(urls, sampleSize) {
  if (sampleSize <= 0) return [];
  if (urls.length <= sampleSize) return urls;

  const step = Math.max(1, Math.floor(urls.length / sampleSize));
  const sampled = [];
  for (let i = 0; i < urls.length && sampled.length < sampleSize; i += step) {
    sampled.push(urls[i]);
  }
  return sampled.slice(0, sampleSize);
}

function remapToBaseOrigin(url, baseUrl) {
  const base = new URL(baseUrl);
  const parsed = new URL(url);
  return `${base.origin}${parsed.pathname}${parsed.search}`;
}

async function main() {
  const args = parseArgs();
  const mode = (args.mode || "pr").toString();
  const targetsPath = (args.targets || "quality/targets.json").toString();
  const output = (args.output || "quality/reports/selected-urls.json").toString();
  const overrideBaseUrl = (args["base-url"] || process.env.QUALITY_BASE_URL_OVERRIDE || "").toString().trim();

  const targets = await loadTargets(targetsPath);
  const baseUrl = pickBaseUrl({ mode, targets, overrideBaseUrl });

  if (!/^https?:\/\//i.test(baseUrl || "")) {
    throw new Error(
      "invalid_base_url: defina quality/targets.json::baseUrlProd ou passe --base-url. " +
        "Se quiser URL de preview por PR, configure baseUrlPreview.",
    );
  }

  const criticalPaths = Array.isArray(targets.pathsCriticos) ? targets.pathsCriticos : [];
  const criticalUrls = criticalPaths.map((entry) => toAbsoluteUrl(entry, baseUrl));

  const profile = modeToProfile(mode);
  const sampleSize =
    profile === "nightly"
      ? Number(targets.sampleSizes?.nightlySitemap ?? 10)
      : Number(targets.sampleSizes?.prSitemap ?? 3);

  let sitemapSample = [];
  if (targets.sitemapUrl) {
    try {
      const sitemapData = await collectSitemapUrls({
        sitemapUrl: targets.sitemapUrl,
        baseUrl,
        limit: Math.max(sampleSize * 3, sampleSize),
      });

      const remapped = sitemapData.urls
        .map((url) => {
          try {
            return remapToBaseOrigin(url, baseUrl);
          } catch {
            return "";
          }
        })
        .filter(Boolean);

      const deduped = remapped.filter((url) => !criticalUrls.includes(url));
      sitemapSample = deterministicSample(deduped, sampleSize);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`[select_audit_urls] WARN sitemap unavailable: ${error?.message ?? error}`);
    }
  }

  const urls = [...new Set([...criticalUrls, ...sitemapSample])];
  const payload = {
    generatedAt: new Date().toISOString(),
    mode,
    baseUrl,
    criticalUrls,
    sitemapSample,
    urls,
  };

  await writeJson(output, payload);
  await ensureDir("quality/reports");
  await writeFile("quality/reports/urls.txt", `${urls.join("\n")}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`[select_audit_urls] selected ${urls.length} URL(s) for mode=${mode}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[select_audit_urls] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
