import { parseArgs, writeJson, toAbsoluteUrl } from "./quality/common.mjs";

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractLocs(xmlText) {
  const locs = [];
  const regex = /<loc>(.*?)<\/loc>/gims;
  let match = regex.exec(xmlText);
  while (match) {
    locs.push(decodeXml(match[1].trim()));
    match = regex.exec(xmlText);
  }
  return locs;
}

async function fetchXml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "quality-automation-bot/1.0",
      accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`sitemap_fetch_failed:${res.status}:${url}`);
  }
  return res.text();
}

export async function collectSitemapUrls({ sitemapUrl, baseUrl, limit = 50, maxSitemaps = 6 }) {
  const rootSitemapUrl = toAbsoluteUrl(sitemapUrl, baseUrl);
  const visitedSitemaps = new Set();
  const discoveredUrls = [];

  async function crawl(url) {
    if (visitedSitemaps.has(url) || visitedSitemaps.size >= maxSitemaps) return;
    visitedSitemaps.add(url);

    const xml = await fetchXml(url);
    const locs = extractLocs(xml);

    if (/<sitemapindex/i.test(xml)) {
      for (const loc of locs) {
        if (visitedSitemaps.size >= maxSitemaps) break;
        if (/\.xml($|\?)/i.test(loc)) {
          // eslint-disable-next-line no-await-in-loop
          await crawl(loc);
        }
      }
      return;
    }

    for (const loc of locs) {
      if (!/^https?:\/\//i.test(loc)) continue;
      discoveredUrls.push(loc);
      if (discoveredUrls.length >= limit) break;
    }
  }

  await crawl(rootSitemapUrl);

  return {
    sitemapUrl: rootSitemapUrl,
    urls: [...new Set(discoveredUrls)].slice(0, limit),
    scannedSitemaps: [...visitedSitemaps],
  };
}

async function main() {
  const args = parseArgs();
  const baseUrl = (args["base-url"] || args.baseUrl || "").toString().trim();
  const sitemapUrl = (args["sitemap-url"] || args.sitemapUrl || "/sitemap.xml").toString().trim();
  const output = (args.output || "quality/reports/sitemap-urls.json").toString();
  const limit = Number.parseInt((args.limit || "50").toString(), 10);

  if (!baseUrl) {
    throw new Error("missing_base_url: pass --base-url=https://example.com");
  }

  const result = await collectSitemapUrls({
    sitemapUrl,
    baseUrl,
    limit: Number.isFinite(limit) ? limit : 50,
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    ...result,
  };

  await writeJson(output, payload);
  // eslint-disable-next-line no-console
  console.log(`Sitemap URLs: ${payload.urls.length} (saved at ${output})`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[fetch_sitemap_urls] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
