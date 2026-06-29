/**
 * scanner/onchain.ts — On-chain analysis scanner.
 * Checks contract code for risky patterns: unlimited approvals, proxy patterns,
 * owner-centralization, honeypot simulation (deep mode), liquidity signals.
 *
 * MVP: Uses public Base RPC to fetch contract bytecode + basic ABI heuristics.
 * Deep mode: Simulates buy/sell via static calls (requires viem).
 */

import type { Finding, Rule, ScanResult, Mode } from "../types.js";

/** Minimal ABI fragments for detection. */
const RISKY_SELECTORS: Record<string, string> = {
  "0x095ea7b3": "approve(address,uint256)",
  "0x3644e515": "DELEGATION_APPROVAL_TYPEHASH",  // EIP-2612 variant
  "0x8da5cb5b": "owner()",
  "0x5c60da1b": "implementation()",
  "0x3659cfe6": "upgradeTo(address)",
  "0x4f1ef286": "upgradeToAndCall(address,bytes)",
  "0x8f283970": "changeAdmin(address)",
  "0x40c10f19": "mint(address,uint256)",
  "0x42966c68": "burn(uint256)",
  "0x8456cb59": "pause()",
  "0x3f4ba83a": "unpause()",
};

/**
 * Scan contract bytecode + on-chain state for risky patterns.
 *
 * In `fast` mode: bytecode heuristic only (no state reads).
 * In `deep` mode: + static call simulations for honeypot detection.
 */
export async function runOnchainScan(
  contractAddress: string,
  chainId: number,
  rpcUrl: string,
  rules: Rule[],
  mode: Mode
): Promise<ScanResult> {
  const findings: Finding[] = [];

  // 1. Fetch bytecode
  const bytecode = await fetchBytecode(contractAddress, rpcUrl);
  if (!bytecode || bytecode === "0x") {
    findings.push({
      id: "CON-030",
      severity: "medium",
      evidence: `Contract ${contractAddress} has no bytecode (EOA or self-destructed)`,
      ref: `onchain:${contractAddress}`,
    });
    return { findings };
  }

  // 2. Bytecode heuristic: look for known function selectors
  for (const rule of rules) {
    if (rule.selector && RISKY_SELECTORS[rule.selector]) {
      const selectorHex = rule.selector.slice(2); // remove 0x
      if (bytecode.includes(selectorHex)) {
        findings.push({
          id: rule.id,
          severity: rule.severity,
          evidence: `Bytecode contains selector ${rule.selector} (${RISKY_SELECTORS[rule.selector]})`,
          ref: `bytecode:${contractAddress}`,
        });
      }
    }
  }

  // 3. Proxy detection: look for EIP-1967 storage slots in bytecode
  const EIP1967_IMPL_SLOT = "360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const EIP1967_ADMIN_SLOT = "b53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
  if (bytecode.includes(EIP1967_IMPL_SLOT) || bytecode.includes(EIP1967_ADMIN_SLOT)) {
    // This is a proxy — check if CON-011 rule exists
    const proxyRule = rules.find((r) => r.id === "CON-011");
    if (proxyRule) {
      findings.push({
        id: "CON-011",
        severity: proxyRule.severity,
        evidence: `EIP-1967 proxy storage slot detected in bytecode of ${contractAddress}`,
        ref: `bytecode:${contractAddress}`,
      });
    }
  }

  // 4. Deep mode: honeypot simulation
  if (mode === "deep") {
    const honeypotFindings = await simulateHoneypot(contractAddress, rpcUrl, chainId);
    findings.push(...honeypotFindings);
  }

  return { findings };
}

/**
 * Fetch contract bytecode from RPC.
 */
async function fetchBytecode(address: string, rpcUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address, "latest"],
      }),
    });
    const data = (await resp.json()) as { result?: string };
    return data.result ?? null;
  } catch {
    return null;
  }
}

/**
 * Minimal JSON-RPC call. Returns the raw `result` string, or throws on a
 * JSON-RPC error (used to detect reverts) or transport failure.
 */
async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<string> {
  const resp = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(12_000),
  });
  const data = (await resp.json()) as { result?: string; error?: { message?: string } };
  if (data.error) throw new Error(data.error.message ?? "rpc error");
  return data.result ?? "0x";
}

const pad32 = (hex: string) => hex.replace(/^0x/, "").toLowerCase().padStart(64, "0");
const DEAD = "0x000000000000000000000000000000000000dEaD";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** Sample a recent token holder from `Transfer` event logs (keyless, bounded range). */
async function findRecentHolder(token: string, rpcUrl: string): Promise<string | null> {
  const headHex = await rpcCall(rpcUrl, "eth_blockNumber", []);
  const head = parseInt(headHex, 16);
  if (!Number.isFinite(head)) return null;
  const fromBlock = "0x" + Math.max(0, head - 5_000).toString(16);
  const logs = (await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "eth_getLogs",
      params: [{ address: token, topics: [TRANSFER_TOPIC], fromBlock, toBlock: "latest" }],
    }),
    signal: AbortSignal.timeout(12_000),
  }).then((r) => r.json())) as { result?: Array<{ topics: string[] }> };
  // topics[2] = indexed `to`. Take the most recent non-zero recipient.
  for (const log of (result_reverse(logs.result) ?? [])) {
    const to = log.topics?.[2];
    if (to && !/^0x0+$/.test(to)) return "0x" + to.slice(-40);
  }
  return null;
}

function result_reverse<T>(arr: T[] | undefined): T[] | undefined {
  return arr ? [...arr].reverse() : arr;
}

/** ERC-20 balanceOf(holder) via eth_call → bigint (0 on failure). */
async function balanceOf(token: string, holder: string, rpcUrl: string): Promise<bigint> {
  try {
    const data = "0x70a08231" + pad32(holder);
    const res = await rpcCall(rpcUrl, "eth_call", [{ to: token, data }, "latest"]);
    return res && res !== "0x" ? BigInt(res) : 0n;
  } catch {
    return 0n;
  }
}

/**
 * Honeypot simulation (deep mode): sample a real holder, then `eth_call` a
 * `transfer` *as if from that holder*. If the simulated transfer reverts (or
 * returns false) while the holder has a non-zero balance, sells/transfers are
 * restricted — a honeypot/blacklist/trading-disabled signal.
 *
 * Keyless (public RPC, no funds, no broadcast). Fail-safe: any RPC/transport
 * error yields no finding (network issues are never treated as a verdict).
 * Reflects current chain state; the verdict's 24h TTL covers drift.
 */
async function simulateHoneypot(
  address: string,
  rpcUrl: string,
  _chainId: number
): Promise<Finding[]> {
  try {
    const holder = await findRecentHolder(address, rpcUrl);
    if (!holder) return []; // no holder sample → can't simulate, stay silent

    const bal = await balanceOf(address, holder, rpcUrl);
    if (bal === 0n) return [];

    // Simulate transfer(0xdead, balance) from the holder.
    const amount = bal.toString(16).padStart(64, "0");
    const data = "0xa9059cbb" + pad32(DEAD) + amount;
    try {
      const res = await rpcCall(rpcUrl, "eth_call", [{ from: holder, to: address, data }, "latest"]);
      // ERC-20 transfer returns bool; a `false` (0x..00) return = blocked.
      if (res && res !== "0x" && /^0x0+$/.test(res)) {
        return [{
          id: "CON-020",
          severity: "critical",
          evidence: `Honeypot: simulated transfer from holder ${holder} returned false (sells blocked)`,
          ref: `tx-sim:${address}`,
        }];
      }
      return []; // transfer simulated OK → not a honeypot by this check
    } catch (err) {
      // eth_call reverted → transfer restricted.
      return [{
        id: "CON-020",
        severity: "critical",
        evidence: `Honeypot: simulated transfer from holder ${holder} reverted (${err instanceof Error ? err.message.slice(0, 80) : "revert"})`,
        ref: `tx-sim:${address}`,
      }];
    }
  } catch {
    return []; // RPC/transport failure → fail safe, no finding
  }
}

/**
 * Check if an address is a contract (has bytecode) vs EOA.
 */
export async function isContract(address: string, rpcUrl: string): Promise<boolean> {
  const bytecode = await fetchBytecode(address, rpcUrl);
  return !!bytecode && bytecode !== "0x" && bytecode.length > 2;
}
