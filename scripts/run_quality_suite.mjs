import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import process from "node:process";
import { parseArgs } from "./quality/common.mjs";

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      env: process.env,
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`command_failed:${command} ${args.join(" ")} (exit ${code})`));
    });

    child.on("error", reject);
  });
}

async function waitForUrl(url, timeoutMs = 120_000) {
  const startedAt = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      if (res.ok) return;
    } catch {
      // retry
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`timeout_waiting_for_url:${url}`);
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function main() {
  const args = parseArgs();
  const mode = (args.mode || "pr").toString();
  const serveLocal = args["serve-local"] === true || args["serve-local"] === "true";
  const skipBuild = args["skip-build"] === true || args["skip-build"] === "true";
  const enforceGate = args["enforce-gate"] === true || args["enforce-gate"] === "true";

  let baseUrl = (args["base-url"] || "").toString().trim();
  let serverProcess = null;
  const stepErrors = [];

  try {
    if (serveLocal) {
      baseUrl = baseUrl || "http://127.0.0.1:3000";

      if (!skipBuild) {
        await runCommand("npm", ["run", "build"]);
      }

      serverProcess = spawn("npm", ["run", "start", "--", "-H", "127.0.0.1", "-p", "3000"], {
        stdio: "inherit",
        env: process.env,
      });

      await waitForUrl(baseUrl);
    }

    const selectArgs = ["scripts/select_audit_urls.mjs", `--mode=${mode}`];
    if (baseUrl) selectArgs.push(`--base-url=${baseUrl}`);

    await Promise.all([
      rm("quality/reports", { recursive: true, force: true }),
      rm(".lighthouseci", { recursive: true, force: true }),
    ]);
    await runCommand("node", selectArgs);

    const steps = [
      {
        name: "lhci",
        run: () =>
          runCommand("npx", ["-y", "@lhci/cli", "autorun", "--config=./lighthouserc.cjs"], {
            env: {
              ...process.env,
              QUALITY_MODE: mode,
            },
          }),
      },
      { name: "axe", run: () => runCommand("node", ["scripts/run_axe.mjs"]) },
      { name: "linkcheck", run: () => runCommand("node", ["scripts/run_linkcheck.mjs"]) },
      { name: "ui_snapshots", run: () => runCommand("node", ["scripts/ui_snapshots.mjs"]) },
      {
        name: "summarize",
        run: () => runCommand("node", ["scripts/summarize_quality.mjs", `--mode=${mode}`]),
      },
    ];

    for (const step of steps) {
      // eslint-disable-next-line no-console
      console.log(`[run_quality_suite] step=${step.name}`);
      try {
        // eslint-disable-next-line no-await-in-loop
        await step.run();
      } catch (error) {
        stepErrors.push({ step: step.name, message: error?.message ?? String(error) });
        // eslint-disable-next-line no-console
        console.warn(`[run_quality_suite] step failed (${step.name}): ${error?.message ?? error}`);
      }
    }

    const gateArgs = ["scripts/quality_gate.mjs", `--mode=${mode}`];
    if (enforceGate) gateArgs.push("--enforce=true");
    await runCommand("node", gateArgs);

    if (stepErrors.length > 0) {
      throw new Error(
        `quality_suite_incomplete:${stepErrors.map((item) => `${item.step}:${item.message}`).join(" | ")}`,
      );
    }
  } finally {
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[run_quality_suite] FAILED: ${error?.message ?? error}`);
  process.exit(1);
});
