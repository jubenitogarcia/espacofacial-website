import { appendFile } from "node:fs/promises";
import {
  mdTable,
  modeToProfile,
  parseArgs,
  readJson,
  writeJson,
  writeText,
} from "./quality/common.mjs";

function asPercent(score) {
  return Math.round(score * 100);
}

async function writeGithubOutput(outputs) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  const lines = [];
  for (const [key, value] of Object.entries(outputs)) {
    lines.push(`${key}=${String(value)}`);
  }
  await appendFile(outputPath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const args = parseArgs();
  const mode = (args.mode || "pr").toString();
  const profile = modeToProfile(mode);
  const summaryPath = (args.summary || "quality/reports/summary.json").toString();
  const enforce = args.enforce === true || args.enforce === "true";

  const [summary, gates] = await Promise.all([
    readJson(summaryPath),
    readJson("quality/gates.json"),
  ]);

  const gate = gates[profile];
  if (!gate) {
    throw new Error(`gate_profile_not_found:${profile}`);
  }

  const failures = [];

  const scoreMap = {
    performance: summary.lighthouse?.scores?.performance,
    accessibility: summary.lighthouse?.scores?.accessibility,
    bestPractices: summary.lighthouse?.scores?.bestPractices,
    seo: summary.lighthouse?.scores?.seo,
  };

  for (const [key, minValue] of Object.entries(gate.minScores ?? {})) {
    const actual = scoreMap[key];
    if (typeof actual !== "number") continue;
    if (actual < Number(minValue)) {
      failures.push({
        area: "lighthouse",
        metric: key,
        expected: `>= ${asPercent(Number(minValue))}%`,
        actual: `${asPercent(actual)}%`,
      });
    }
  }

  const brokenLinks = Number(summary.linkcheck?.totalBroken ?? 0);
  if (brokenLinks > Number(gate.maxBrokenLinks ?? 0)) {
    failures.push({
      area: "links",
      metric: "brokenLinks",
      expected: `<= ${gate.maxBrokenLinks}`,
      actual: String(brokenLinks),
    });
  }

  const axeCritical = Number(summary.axe?.impactCounts?.critical ?? 0);
  if (axeCritical > Number(gate.maxAxeCritical ?? 0)) {
    failures.push({
      area: "a11y",
      metric: "axeCritical",
      expected: `<= ${gate.maxAxeCritical}`,
      actual: String(axeCritical),
    });
  }

  const axeSerious = Number(summary.axe?.impactCounts?.serious ?? 0);
  if (axeSerious > Number(gate.maxAxeSerious ?? 0)) {
    failures.push({
      area: "a11y",
      metric: "axeSerious",
      expected: `<= ${gate.maxAxeSerious}`,
      actual: String(axeSerious),
    });
  }

  const clsThreshold = Number(gate.clsHighThreshold ?? 0.1);
  const highClsPages = (summary.ui?.captures ?? []).filter((entry) => {
    const cls = Number(entry?.metrics?.cls ?? 0);
    return Number.isFinite(cls) && cls > clsThreshold;
  }).length;

  if (highClsPages > Number(gate.maxHighClsPages ?? 0)) {
    failures.push({
      area: "ux",
      metric: "highClsPages",
      expected: `<= ${gate.maxHighClsPages}`,
      actual: String(highClsPages),
    });
  }

  const relevantRegression = failures.length > 0;

  const gatePayload = {
    generatedAt: new Date().toISOString(),
    mode,
    profile,
    relevantRegression,
    failureCount: failures.length,
    failures,
    topIssues: summary.topIssues ?? [],
  };

  await writeJson("quality/reports/gate.json", gatePayload);

  const failureRows = failures.map((item) => [
    item.area,
    item.metric,
    item.expected,
    item.actual,
  ]);

  const gateMd = [
    "# Quality Gate",
    "",
    `- Profile: ${profile}`,
    `- Regressão relevante: ${relevantRegression ? "sim" : "não"}`,
    `- Falhas: ${failures.length}`,
    "",
    mdTable(["Área", "Métrica", "Esperado", "Atual"], failureRows),
  ].join("\n");

  await writeText("quality/reports/gate.md", `${gateMd}\n`);

  await writeGithubOutput({
    relevant_regression: relevantRegression,
    failure_count: failures.length,
    gate_profile: profile,
  });

  // eslint-disable-next-line no-console
  console.log(`[quality_gate] profile=${profile} failures=${failures.length}`);

  if (enforce && relevantRegression) {
    process.exit(1);
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[quality_gate] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
