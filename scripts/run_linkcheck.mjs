import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mdTable, parseArgs, readJson, writeJson, writeText } from "./quality/common.mjs";

const execFileAsync = promisify(execFile);

function tryParseJson(output) {
  const trimmed = output.trim();
  if (!trimmed) return null;
  const firstBrace = trimmed.search(/[\[{]/);
  if (firstBrace < 0) return null;
  const candidate = trimmed.slice(firstBrace);
  return JSON.parse(candidate);
}

async function runLinkinator(args) {
  try {
    const { stdout } = await execFileAsync("npx", ["-y", "linkinator", ...args], {
      maxBuffer: 1024 * 1024 * 50,
    });
    return tryParseJson(stdout);
  } catch (error) {
    const stdout = typeof error?.stdout === "string" ? error.stdout : "";
    const parsed = tryParseJson(stdout);
    if (parsed) return parsed;
    throw error;
  }
}

async function listMarkdownFiles() {
  try {
    const { stdout } = await execFileAsync("rg", [
      "--files",
      "-g",
      "*.md",
      "-g",
      "!.next/**",
      "-g",
      "!node_modules/**",
      "-g",
      "!quality/reports/**",
      "-g",
      "!output/**",
    ]);
    return stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return ["README.md"];
  }
}

function collectBroken(report) {
  const links = Array.isArray(report?.links) ? report.links : [];
  return links
    .filter((entry) => entry.state === "BROKEN")
    .filter((entry) => !(entry.url === "." && !entry.parent))
    .map((entry) => ({
      url: entry.url,
      parent: entry.parent,
      status: entry.status,
      failureReason: entry.failureReason,
    }));
}

async function main() {
  const args = parseArgs();
  const input = (args.input || "quality/reports/selected-urls.json").toString();
  const output = (args.output || "quality/reports/linkcheck.json").toString();
  const summaryOut = (args.summary || "quality/reports/linkcheck-summary.md").toString();

  const selected = await readJson(input);
  const urls = Array.isArray(selected.urls) ? selected.urls : [];
  const markdownTargets = await listMarkdownFiles();

  const markdownReport = await runLinkinator([
    ...markdownTargets,
    "--markdown",
    "--format",
    "json",
    "--verbosity",
    "error",
    "--skip",
    "node_modules",
    "--skip",
    "\\.next",
    "--skip",
    "quality/reports",
    "--skip",
    "output",
    "--status-code",
    "429:warn",
  ]);

  let siteReport = { links: [] };
  if (urls.length > 0) {
    siteReport =
      (await runLinkinator([
        ...urls,
        "--format",
        "json",
        "--verbosity",
        "error",
        "--check-fragments",
        "--retry-errors",
        "--retry-errors-count",
        "1",
        "--status-code",
        "429:warn",
      ])) ?? { links: [] };
  }

  const markdownBroken = collectBroken(markdownReport);
  const siteBroken = collectBroken(siteReport);

  const payload = {
    generatedAt: new Date().toISOString(),
    markdown: {
      scanned: Number(markdownReport?.links?.length ?? 0),
      broken: markdownBroken.length,
      brokenLinks: markdownBroken,
    },
    site: {
      scanned: Number(siteReport?.links?.length ?? 0),
      broken: siteBroken.length,
      brokenLinks: siteBroken,
    },
    totalBroken: markdownBroken.length + siteBroken.length,
  };

  await writeJson(output, payload);

  const rows = [...markdownBroken, ...siteBroken].slice(0, 12).map((entry) => [
    entry.status ? String(entry.status) : "-",
    (entry.parent || "-").replace(/\|/g, "\\|"),
    (entry.url || "-").replace(/\|/g, "\\|"),
  ]);

  const md = [
    "# Link Check Summary",
    "",
    `- Links markdown escaneados: ${payload.markdown.scanned}`,
    `- Links site escaneados: ${payload.site.scanned}`,
    `- Total de links quebrados: ${payload.totalBroken}`,
    "",
    "## Principais links quebrados",
    "",
    mdTable(["Status", "Origem", "Destino"], rows),
  ].join("\n");

  await writeText(summaryOut, `${md}\n`);
  // eslint-disable-next-line no-console
  console.log(`[run_linkcheck] broken=${payload.totalBroken}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[run_linkcheck] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
