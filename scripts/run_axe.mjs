import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import {
  ensureDir,
  mdTable,
  parseArgs,
  readJson,
  slugifyForFile,
  writeJson,
  writeText,
} from "./quality/common.mjs";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve("axe-core/axe.min.js");

function safeImpact(impact) {
  return ["critical", "serious", "moderate", "minor"].includes(impact) ? impact : "unknown";
}

async function runAxeForUrl(url, outPath) {
  const chromePath = chromium.executablePath();
  const args = [
    "@axe-core/cli",
    url,
    "--save",
    outPath,
    "--timeout",
    "120",
    "--load-delay",
    "900",
    "--show-errors",
    "false",
    "--no-reporter",
    "--chrome-path",
    chromePath,
  ];

  await execFileAsync("npx", ["-y", ...args], {
    maxBuffer: 1024 * 1024 * 20,
  });
}

async function runAxeWithPlaywright(url, outPath) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForTimeout(800);
    await page.addScriptTag({ path: axeSourcePath });
    const result = await page.evaluate(async () => window.axe.run(document));
    const payload = {
      url,
      timestamp: new Date().toISOString(),
      ...result,
    };
    await writeJson(outPath, payload);
    await context.close();
  } finally {
    await browser.close();
  }
}

function summarizeViolations(results) {
  const impactCounts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
  };

  const ruleMap = new Map();

  for (const result of results) {
    for (const violation of result.violations ?? []) {
      const impact = safeImpact(violation.impact);
      impactCounts[impact] += 1;

      const key = violation.id || "unknown-rule";
      const current = ruleMap.get(key) ?? {
        id: key,
        impact,
        description: violation.description || violation.help || "",
        occurrences: 0,
        urls: new Set(),
      };

      current.occurrences += Number(violation.nodes?.length ?? 1);
      current.urls.add(result.url || "");
      ruleMap.set(key, current);
    }
  }

  const topRules = [...ruleMap.values()]
    .map((entry) => ({
      ...entry,
      urls: [...entry.urls],
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  return { impactCounts, topRules };
}

async function main() {
  const args = parseArgs();
  const input = (args.input || "quality/reports/selected-urls.json").toString();
  const output = (args.output || "quality/reports/axe.json").toString();
  const summaryOut = (args.summary || "quality/reports/axe-summary.md").toString();

  const selected = await readJson(input);
  const urls = Array.isArray(selected.urls) ? selected.urls : [];

  if (urls.length === 0) {
    throw new Error("no_urls_found_for_axe");
  }

  const rawDir = "quality/reports/axe/raw";
  await ensureDir(rawDir);

  const perUrl = [];
  const failures = [];

  for (const url of urls) {
    const fileBase = slugifyForFile(url);
    const rawOut = path.join(rawDir, `${fileBase}.json`);

    try {
      // eslint-disable-next-line no-await-in-loop
      await runAxeForUrl(url, rawOut);
    } catch (error) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await runAxeWithPlaywright(url, rawOut);
        // eslint-disable-next-line no-console
        console.warn(
          `[run_axe] CLI failed for ${url}; fallback Playwright+axe-core applied (${error?.message ?? error})`,
        );
      } catch (fallbackError) {
        failures.push({
          url,
          error: fallbackError?.message ?? String(fallbackError),
        });
        // eslint-disable-next-line no-console
        console.warn(`[run_axe] failed ${url}: ${fallbackError?.message ?? fallbackError}`);
        continue;
      }
    }

    // eslint-disable-next-line no-await-in-loop
    const result = await readJson(rawOut);
    perUrl.push(result);
    // eslint-disable-next-line no-console
    console.log(`[run_axe] ok ${url}`);
  }

  const { impactCounts, topRules } = summarizeViolations(perUrl);
  const payload = {
    generatedAt: new Date().toISOString(),
    totalUrls: urls.length,
    successfulUrls: perUrl.length,
    failedUrls: failures.length,
    impactCounts,
    topRules,
    failures,
    perUrl: perUrl.map((item) => ({
      url: item.url,
      violations: (item.violations ?? []).length,
      passes: (item.passes ?? []).length,
      incomplete: (item.incomplete ?? []).length,
      inapplicable: (item.inapplicable ?? []).length,
    })),
  };

  await writeJson(output, payload);

  const perUrlRows = payload.perUrl.slice(0, 15).map((item) => [
    item.url,
    String(item.violations),
    String(item.incomplete),
  ]);

  const topRuleRows = topRules.slice(0, 8).map((rule) => [
    rule.id,
    rule.impact,
    String(rule.occurrences),
  ]);

  const md = [
    "# Axe Accessibility Summary",
    "",
    `- URLs auditadas: ${payload.totalUrls}`,
    `- URLs com sucesso: ${payload.successfulUrls}`,
    `- URLs com falha: ${payload.failedUrls}`,
    `- Violations: critical=${impactCounts.critical}, serious=${impactCounts.serious}, moderate=${impactCounts.moderate}, minor=${impactCounts.minor}`,
    "",
    "## Top regras",
    "",
    mdTable(["Regra", "Impact", "Ocorrências"], topRuleRows),
    "",
    "## Por URL",
    "",
    mdTable(["URL", "Violations", "Incomplete"], perUrlRows),
  ].join("\n");

  await writeText(summaryOut, `${md}\n`);
  // eslint-disable-next-line no-console
  console.log(`[run_axe] summary written to ${output}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[run_axe] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
