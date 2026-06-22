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
 * Honeypot simulation: attempt a simulated buy+sell via eth_call.
 * If sell reverts or returns 0, the contract is likely a honeypot.
 *
 * MVP: simplified — real implementation would use a DEX router simulation.
 */
async function simulateHoneypot(
  _address: string,
  _rpcUrl: string,
  _chainId: number
): Promise<Finding[]> {
  const findings: Finding[] = [];

  // TODO: Implement real buy/sell simulation via DEX router static calls.
  // For MVP, this is a placeholder that returns no findings.
  // Real implementation would:
  //   1. Call swapExactETHForTokens (buy) with a small amount
  //   2. Call swapExactTokensForETH (sell) with the received tokens
  //   3. If sell fails or returns < 80% of buy value → honeypot

  return findings;
}

/**
 * Check if an address is a contract (has bytecode) vs EOA.
 */
export async function isContract(address: string, rpcUrl: string): Promise<boolean> {
  const bytecode = await fetchBytecode(address, rpcUrl);
  return !!bytecode && bytecode !== "0x" && bytecode.length > 2;
}
