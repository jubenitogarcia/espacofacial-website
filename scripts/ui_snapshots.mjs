import path from "node:path";
import { chromium, devices } from "playwright";
import {
  ensureDir,
  mdTable,
  parseArgs,
  readJson,
  slugifyForFile,
  writeJson,
  writeText,
} from "./quality/common.mjs";

const MOBILE = devices["iPhone 13"];
const VIEWPORTS = [
  {
    name: "desktop",
    contextOptions: {
      viewport: { width: 1366, height: 900 },
      userAgent: "quality-bot-desktop",
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
    },
  },
  {
    name: "mobile",
    contextOptions: {
      ...MOBILE,
    },
  },
];

function evaluateObservations(metrics) {
  const observations = [];

  if (metrics.horizontalOverflowPx > 0) {
    observations.push(
      `Overflow horizontal detectado (${metrics.horizontalOverflowPx}px além da viewport).`,
    );
  }

  if (metrics.cls > 0.1) {
    observations.push(`Possível layout shift visível (CLS=${metrics.cls.toFixed(3)}).`);
  }

  if (metrics.scrollHeightRatio > 2.5) {
    observations.push(
      `Conteúdo relevante abaixo da dobra (altura total ${metrics.scrollHeightRatio.toFixed(2)}x viewport).`,
    );
  }

  if (metrics.h1Count === 0) {
    observations.push("Página sem H1 renderizado no snapshot.");
  }

  return observations;
}

async function capture(page, url, outDir, variant) {
  await page.addInitScript(() => {
    window.__qualityMetrics = { cls: 0 };
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__qualityMetrics.cls += entry.value;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch {
      // noop
    }
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;

    const scrollWidth = Math.max(root?.scrollWidth ?? 0, body?.scrollWidth ?? 0);
    const clientWidth = Math.max(root?.clientWidth ?? 0, window.innerWidth ?? 0);
    const scrollHeight = Math.max(root?.scrollHeight ?? 0, body?.scrollHeight ?? 0);
    const viewportHeight = Math.max(root?.clientHeight ?? 0, window.innerHeight ?? 0);
    const h1Count = document.querySelectorAll("h1").length;
    const cls = window.__qualityMetrics?.cls ?? 0;

    return {
      scrollWidth,
      clientWidth,
      scrollHeight,
      viewportHeight,
      h1Count,
      cls,
      horizontalOverflowPx: Math.max(0, scrollWidth - clientWidth),
      scrollHeightRatio: viewportHeight > 0 ? scrollHeight / viewportHeight : 0,
    };
  });

  const fileBase = `${slugifyForFile(url)}-${variant}`;
  const screenshotPath = path.join(outDir, `${fileBase}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return {
    url,
    variant,
    screenshotPath,
    metrics,
    observations: evaluateObservations(metrics),
  };
}

async function main() {
  const args = parseArgs();
  const input = (args.input || "quality/reports/selected-urls.json").toString();
  const output = (args.output || "quality/reports/ui/ui.json").toString();
  const summaryOut = (args.summary || "quality/reports/ui/ui-summary.md").toString();
  const outDir = "quality/reports/ui";

  const selected = await readJson(input);
  const urls = Array.isArray(selected.urls) ? selected.urls : [];
  if (urls.length === 0) throw new Error("no_urls_for_ui_snapshots");

  await ensureDir(outDir);

  const browser = await chromium.launch({ headless: true });
  const captures = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext(viewport.contextOptions);
      try {
        for (const url of urls) {
          const page = await context.newPage();
          try {
            // eslint-disable-next-line no-await-in-loop
            const result = await capture(page, url, outDir, viewport.name);
            captures.push(result);
            // eslint-disable-next-line no-console
            console.log(`[ui_snapshots] ${viewport.name} ${url}`);
          } catch (error) {
            captures.push({
              url,
              variant: viewport.name,
              screenshotPath: "",
              metrics: null,
              observations: [`Falha no capture: ${error?.message ?? error}`],
              error: error?.message ?? String(error),
            });
            // eslint-disable-next-line no-console
            console.warn(`[ui_snapshots] failed ${viewport.name} ${url}: ${error?.message ?? error}`);
          } finally {
            // eslint-disable-next-line no-await-in-loop
            await page.close();
          }
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const highRisk = captures.filter((entry) => {
    if (!entry.metrics) return true;
    return entry.metrics.horizontalOverflowPx > 0 || entry.metrics.cls > 0.1;
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    captures,
    highRiskCount: highRisk.length,
  };

  await writeJson(output, payload);

  const rows = captures.slice(0, 20).map((entry) => {
    const cls = entry.metrics?.cls ?? NaN;
    const overflow = entry.metrics?.horizontalOverflowPx ?? NaN;
    return [
      `${entry.variant}`,
      entry.url,
      Number.isFinite(cls) ? cls.toFixed(3) : "-",
      Number.isFinite(overflow) ? String(overflow) : "-",
      (entry.observations?.[0] ?? "OK").replace(/\|/g, "\\|"),
    ];
  });

  const md = [
    "# UI Snapshot Summary",
    "",
    `- Capturas: ${captures.length}`,
    `- Capturas com risco alto (overflow/CLS): ${highRisk.length}`,
    "",
    "## Capturas",
    "",
    mdTable(["Viewport", "URL", "CLS", "Overflow(px)", "Observação"], rows),
  ].join("\n");

  await writeText(summaryOut, `${md}\n`);
  // eslint-disable-next-line no-console
  console.log(`[ui_snapshots] captures=${captures.length}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[ui_snapshots] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
