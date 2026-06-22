#!/usr/bin/env node
/**
 * cli.ts — Command-line interface for phylax-skill-audit.
 *
 * Usage:
 *   phylax --skill <path-or-url> [--contracts 0x...] [--endpoints https://...] [--mode fast|deep]
 *   phylax --skill ./SKILL.md
 *   phylax --skill https://raw.githubusercontent.com/owner/repo/main/SKILL.md
 */

import { readFileSync } from "node:fs";
import { audit } from "./index.js";
import type { AuditInput } from "./types.js";

async function main() {
  const args = process.argv.slice(2);
  const flags = parseArgs(args);

  if (flags["help"] || flags["h"]) {
    printUsage();
    process.exit(0);
  }

  const skillSource = flags["skill"] ?? flags["s"];
  if (!skillSource) {
    console.error("Error: --skill <path-or-url> is required");
    printUsage();
    process.exit(1);
  }

  // Read SKILL.md if local file
  let skillMd: string | undefined;
  try {
    skillMd = readFileSync(String(skillSource), "utf-8");
  } catch {
    // Not a local file — will be fetched by audit()
  }

  // Read manifest if provided
  let manifest: string | undefined;
  const manifestPath = (flags["manifest"] ?? flags["m"]) as string | undefined;
  if (manifestPath && typeof manifestPath === "string") {
    try {
      manifest = readFileSync(manifestPath, "utf-8");
    } catch {
      console.warn(`Warning: could not read manifest at ${manifestPath}`);
    }
  }

  const contractsStr = flags["contracts"] as string | undefined;
  const endpointsStr = flags["endpoints"] as string | undefined;
  const chainStr = flags["chain"] as string | undefined;
  const modeStr = flags["mode"] as string | undefined;

  const input: AuditInput = {
    skill_source: String(skillSource),
    skill_md: skillMd,
    manifest,
    contracts: contractsStr ? contractsStr.split(",").map((s: string) => s.trim()) : undefined,
    endpoints: endpointsStr ? endpointsStr.split(",").map((s: string) => s.trim()) : undefined,
    chain_id: chainStr ? parseInt(chainStr, 10) : undefined,
    mode: (modeStr === "deep" ? "deep" : "fast") as "fast" | "deep",
  };

  const result = await audit(input);

  // Output JSON
  console.log(JSON.stringify(result, null, 2));

  // Exit code: 0 for ALLOW, 1 for WARN, 2 for DENY
  if (result.verdict === "ALLOW") process.exit(0);
  if (result.verdict === "WARN") process.exit(1);
  process.exit(2);
}

function parseArgs(args: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

function printUsage() {
  console.log(`
Phylax — Skill Audit CLI

Usage:
  phylax --skill <path-or-url> [options]

Options:
  --skill, -s     Path to SKILL.md or URL (required)
  --manifest, -m  Path to catalog.json / skills.json (optional)
  --contracts     Comma-separated contract addresses (optional, auto-extracted if omitted)
  --endpoints     Comma-separated endpoint URLs (optional, auto-extracted if omitted)
  --chain         Chain ID (default: 8453 for Base)
  --mode          Audit mode: fast (default) | deep
  --help, -h      Show this help

Exit codes:
  0  ALLOW
  1  WARN
  2  DENY
`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(3);
});
