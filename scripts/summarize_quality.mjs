import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  mdTable,
  modeToProfile,
  parseArgs,
  readJson,
  writeJson,
  writeText,
} from "./quality/common.mjs";

function toPercent(score) {
  if (typeof score !== "number") return null;
  return Math.round(score * 100);
}

function avg(values) {
  if (!values.length) return null;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

async function loadLighthouseReports(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dir, entry.name));

  const reports = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const json = await readJson(file).catch(() => null);
    if (!json?.categories || !json?.audits) continue;
    reports.push(json);
  }
  return reports;
}

function summarizeLighthouse(reports) {
  const perUrl = reports.map((report) => {
    const categories = report.categories;
    return {
      url: report.finalDisplayedUrl || report.finalUrl || "unknown",
      performance: categories.performance?.score ?? null,
      accessibility: categories.accessibility?.score ?? null,
      bestPractices: categories["best-practices"]?.score ?? null,
      seo: categories.seo?.score ?? null,
      lcpMs: report.audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: report.audits["cumulative-layout-shift"]?.numericValue ?? null,
      tbtMs: report.audits["total-blocking-time"]?.numericValue ?? null,
    };
  });

  const scores = {
    performance: avg(perUrl.map((entry) => entry.performance).filter((v) => typeof v === "number")),
    accessibility: avg(perUrl.map((entry) => entry.accessibility).filter((v) => typeof v === "number")),
    bestPractices: avg(perUrl.map((entry) => entry.bestPractices).filter((v) => typeof v === "number")),
    seo: avg(perUrl.map((entry) => entry.seo).filter((v) => typeof v === "number")),
  };

  return {
    totalReports: perUrl.length,
    perUrl,
    scores,
  };
}

function buildTopIssues({ lighthouse, axe, linkcheck, ui }) {
  const issues = [];

  if ((linkcheck?.totalBroken ?? 0) > 0) {
    issues.push({
      area: "links",
      severity: 3,
      title: `${linkcheck.totalBroken} links quebrados detectados`,
      details: "Priorizar links de navegação, CTAs e páginas com status >= 400.",
    });
  }

  if ((axe?.impactCounts?.critical ?? 0) > 0) {
    issues.push({
      area: "a11y",
      severity: 3,
      title: `${axe.impactCounts.critical} violações críticas de acessibilidade`,
      details: "Corrigir primeiro regras com maior recorrência (axe top rules).",
    });
  }

  if ((axe?.impactCounts?.serious ?? 0) > 0) {
    issues.push({
      area: "a11y",
      severity: 2,
      title: `${axe.impactCounts.serious} violações sérias de acessibilidade`,
      details: "Revisar contraste, labels, landmarks e navegação por teclado.",
    });
  }

  if ((ui?.highRiskCount ?? 0) > 0) {
    issues.push({
      area: "ux",
      severity: 2,
      title: `${ui.highRiskCount} snapshots com sinal de risco visual`,
      details: "Analisar overflow horizontal e CLS elevado nas capturas anexadas.",
    });
  }

  for (const [key, label] of [
    ["performance", "Performance"],
    ["accessibility", "Accessibility"],
    ["bestPractices", "Best Practices"],
    ["seo", "SEO"],
  ]) {
    const score = lighthouse?.scores?.[key];
    if (typeof score === "number" && score < 0.8) {
      issues.push({
        area: "lighthouse",
        severity: score < 0.6 ? 3 : 2,
        title: `${label} médio em ${toPercent(score)}%`,
        details: `Revisar pages com score baixo na categoria ${label}.`,
      });
    }
  }

  return issues
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .map((issue, index) => ({ rank: index + 1, ...issue }));
}

async function main() {
  const args = parseArgs();
  const mode = (args.mode || "pr").toString();
  const profile = modeToProfile(mode);

  const selected = await readJson((args.input || "quality/reports/selected-urls.json").toString());
  const axe = await readJson("quality/reports/axe.json").catch(() => null);
  const linkcheck = await readJson("quality/reports/linkcheck.json").catch(() => null);
  const ui = await readJson("quality/reports/ui/ui.json").catch(() => null);

  const lighthouseDir = (args["lighthouse-dir"] || "quality/reports/lighthouse").toString();
  const lighthouseReports = await loadLighthouseReports(lighthouseDir);
  const lighthouse = summarizeLighthouse(lighthouseReports);

  const topIssues = buildTopIssues({ lighthouse, axe, linkcheck, ui });

  const payload = {
    generatedAt: new Date().toISOString(),
    mode,
    profile,
    baseUrl: selected.baseUrl,
    urls: selected.urls,
    lighthouse,
    axe,
    linkcheck,
    ui,
    topIssues,
  };

  await writeJson("quality/reports/summary.json", payload);

  const scoreRows = [
    ["Performance", `${toPercent(lighthouse.scores.performance) ?? "-"}%`],
    ["Accessibility", `${toPercent(lighthouse.scores.accessibility) ?? "-"}%`],
    ["Best Practices", `${toPercent(lighthouse.scores.bestPractices) ?? "-"}%`],
    ["SEO", `${toPercent(lighthouse.scores.seo) ?? "-"}%`],
  ];

  const issuesRows = topIssues.map((issue) => [
    `#${issue.rank}`,
    issue.area,
    issue.title.replace(/\|/g, "\\|"),
  ]);

  const summaryMd = [
    "# Quality Summary",
    "",
    `- Modo: ${mode}`,
    `- Base URL: ${selected.baseUrl}`,
    `- URLs auditadas: ${selected.urls.length}`,
    "",
    "## Lighthouse (média)",
    "",
    mdTable(["Categoria", "Score"], scoreRows),
    "",
    `- Axe critical: ${axe?.impactCounts?.critical ?? "-"}`,
    `- Axe serious: ${axe?.impactCounts?.serious ?? "-"}`,
    `- Links quebrados: ${linkcheck?.totalBroken ?? "-"}`,
    `- UI high-risk snapshots: ${ui?.highRiskCount ?? "-"}`,
    "",
    "## Top 5 problemas",
    "",
    mdTable(["Rank", "Área", "Problema"], issuesRows),
  ].join("\n");

  const prCommentMd = [
    "<!-- quality-automation-report -->",
    "## Quality Ops Report",
    "",
    `- URLs auditadas: **${selected.urls.length}**`,
    `- Lighthouse médio: Perf **${toPercent(lighthouse.scores.performance) ?? "-"}%**, A11y **${
      toPercent(lighthouse.scores.accessibility) ?? "-"
    }%**, BP **${toPercent(lighthouse.scores.bestPractices) ?? "-"}%**, SEO **${
      toPercent(lighthouse.scores.seo) ?? "-"
    }%**`,
    `- Axe: critical **${axe?.impactCounts?.critical ?? "-"}**, serious **${axe?.impactCounts?.serious ?? "-"}**`,
    `- Links quebrados: **${linkcheck?.totalBroken ?? "-"}**`,
    `- UI snapshots (alto risco): **${ui?.highRiskCount ?? "-"}**`,
    "",
    "### Top 5 ações",
    ...topIssues.map((issue) => `- ${issue.title} (${issue.area})`),
    "",
    `Artifacts desta execução: \`${"quality-reports"}\` (veja a run atual do Actions).`,
  ].join("\n");

  const nightlyIssueMd = [
    "## Regressão de Qualidade Detectada (Nightly)",
    "",
    `- Data: ${new Date().toISOString()}`,
    `- Base URL: ${selected.baseUrl}`,
    "",
    "### Resumo",
    summaryMd,
    "",
    "### Recomendações iniciais",
    "1. Corrigir primeiro os itens críticos de acessibilidade e links quebrados em páginas críticas.",
    "2. Rever assets pesados e render-blocking para elevar performance.",
    "3. Validar snapshots com overflow/CLS antes do próximo deploy.",
    "",
    "### Artefatos",
    "- Veja os artifacts do workflow nightly em `quality-reports`.",
  ].join("\n");

  await writeText("quality/reports/summary.md", `${summaryMd}\n`);
  await writeText("quality/reports/pr_comment.md", `${prCommentMd}\n`);
  await writeText("quality/reports/nightly_issue.md", `${nightlyIssueMd}\n`);

  // eslint-disable-next-line no-console
  console.log("[summarize_quality] summary generated");
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[summarize_quality] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
