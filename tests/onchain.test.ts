/**
 * onchain.test.ts — Unit tests for the deep-mode honeypot simulation.
 * Mocks the JSON-RPC `fetch` so the logic is verified deterministically
 * without hitting a live RPC.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { runOnchainScan } from "../src/scanner/onchain.js";

const TOKEN = "0x1111111111111111111111111111111111111111";
const HOLDER_TOPIC = "0x000000000000000000000000abcabcabcabcabcabcabcabcabcabcabcabcabcabc";
const RPC = "https://mainnet.base.org";

const BYTECODE = "0x60806040" + "00".repeat(40);
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const LOGS = [{ topics: [TRANSFER_TOPIC, HOLDER_TOPIC, HOLDER_TOPIC] }];
const BALANCE = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000"; // 1e18
const TRUE_RET = "0x0000000000000000000000000000000000000000000000000000000000000001";
const FALSE_RET = "0x0000000000000000000000000000000000000000000000000000000000000000";

afterEach(() => vi.unstubAllGlobals());

/**
 * Install a fake fetch. `ethCallResults` is consumed in order for successive
 * eth_call requests; a value of {revert:true} simulates a reverted call.
 */
function installRpc(opts: {
  bytecode?: string;
  logs?: unknown[];
  ethCallResults?: Array<string | { revert: true }>;
  countEthCalls?: { n: number };
}) {
  const ethCalls = [...(opts.ethCallResults ?? [])];
  vi.stubGlobal("fetch", async (_url: string, init?: { body?: string }) => {
    const req = JSON.parse(init?.body ?? "{}") as { method: string };
    let result: unknown = "0x";
    let error: { message: string } | undefined;

    if (req.method === "eth_getCode") result = opts.bytecode ?? BYTECODE;
    else if (req.method === "eth_blockNumber") result = "0x100000";
    else if (req.method === "eth_getLogs") result = opts.logs ?? [];
    else if (req.method === "eth_call") {
      if (opts.countEthCalls) opts.countEthCalls.n++;
      const next = ethCalls.shift();
      if (next && typeof next === "object" && "revert" in next) error = { message: "execution reverted" };
      else result = next ?? "0x";
    }
    return {
      ok: true,
      json: async () => (error ? { jsonrpc: "2.0", id: 1, error } : { jsonrpc: "2.0", id: 1, result }),
    } as Response;
  });
}

describe("Onchain deep mode — honeypot simulation", () => {
  it("flags CON-020 when the simulated transfer reverts", async () => {
    installRpc({ logs: LOGS, ethCallResults: [BALANCE, { revert: true }] });
    const res = await runOnchainScan(TOKEN, 8453, RPC, [], "deep");
    const hp = res.findings.find((f) => f.id === "CON-020");
    expect(hp).toBeDefined();
    expect(hp!.severity).toBe("critical");
    expect(hp!.ref).toBe(`tx-sim:${TOKEN}`);
  });

  it("flags CON-020 when transfer returns false", async () => {
    installRpc({ logs: LOGS, ethCallResults: [BALANCE, FALSE_RET] });
    const res = await runOnchainScan(TOKEN, 8453, RPC, [], "deep");
    expect(res.findings.find((f) => f.id === "CON-020")).toBeDefined();
  });

  it("does NOT flag when the simulated transfer succeeds", async () => {
    installRpc({ logs: LOGS, ethCallResults: [BALANCE, TRUE_RET] });
    const res = await runOnchainScan(TOKEN, 8453, RPC, [], "deep");
    expect(res.findings.find((f) => f.id === "CON-020")).toBeUndefined();
  });

  it("stays silent (fail-safe) when no holder can be sampled", async () => {
    installRpc({ logs: [] });
    const res = await runOnchainScan(TOKEN, 8453, RPC, [], "deep");
    expect(res.findings.find((f) => f.id === "CON-020")).toBeUndefined();
  });

  it("does not run the simulation in fast mode", async () => {
    const counter = { n: 0 };
    installRpc({ logs: LOGS, ethCallResults: [BALANCE, TRUE_RET], countEthCalls: counter });
    await runOnchainScan(TOKEN, 8453, RPC, [], "fast");
    expect(counter.n).toBe(0);
  });
});
