import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const keyValue = token.slice(2).split("=");
    const key = keyValue[0];
    if (!key) continue;

    if (keyValue.length > 1) {
      args[key] = keyValue.slice(1).join("=");
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function readJson(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

export async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function writeText(filePath, text) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, text, "utf8");
}

export function normalizeUrl(url) {
  return url.replace(/\/$/, "");
}

export function toAbsoluteUrl(pathOrUrl, baseUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const safeBase = normalizeUrl(baseUrl);
  return `${safeBase}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

export function slugifyForFile(input) {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function loadTargets(targetsPath = "quality/targets.json") {
  return readJson(targetsPath);
}

export function modeToProfile(mode) {
  return mode === "nightly" || mode === "prod" ? "nightly" : "pr";
}

export function mdTable(headers, rows) {
  const headerRow = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return [headerRow, divider, body].filter(Boolean).join("\n");
}
