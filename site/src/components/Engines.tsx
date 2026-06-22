import { m } from "framer-motion";
import { IconStaticScan, IconOnchainScan, IconEndpointScan } from "./Icons";

const engines = [
  {
    icon: IconStaticScan,
    title: "Static Scan",
    desc: "Line-by-line regex scan of SKILL.md and manifest files. Detects injection prompts, secret exfiltration, hidden transfer instructions, and zero-width character obfuscation.",
    tags: ["PI-001", "SEC-001", "MAN-002"],
  },
  {
    icon: IconOnchainScan,
    title: "Onchain Scan",
    desc: "Fetches bytecode from Base (8453) via eth_getCode. Matches function selectors, detects proxy patterns, unverified contracts, honeypot signatures, and hidden mint capabilities.",
    tags: ["CON-020", "CON-012", "CON-011"],
  },
  {
    icon: IconEndpointScan,
    title: "Endpoint Scan",
    desc: "Probes declared x402 payment endpoints. Validates HTTPS enforcement, 402 schema compliance, redirect chains, server errors, and price sanity against market medians.",
    tags: ["X402-001", "X402-041", "X402-030"],
  },
];

export function Engines() {
  return (
    <section id="engines" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
            SCAN ENGINES
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            Three engines. <span className="text-accent">One verdict.</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Each scanner runs independently. Findings merge, deduplicate, and feed into a single deterministic score.
          </p>
        </m.div>

        <div className="grid md:grid-cols-3 gap-5">
          {engines.map((eng, i) => (
            <m.div
              key={eng.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-text-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 border border-border-subtle rounded">
                  <eng.icon size={20} />
                </div>
                <h3 className="font-mono text-[13px] font-bold tracking-wide uppercase">
                  {eng.title}
                </h3>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {eng.desc}
              </p>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
                {eng.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] px-2 py-0.5 bg-bg-elevated border border-border-subtle text-text-muted rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </m.div>
          ))}
        </div>

        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center gap-3 font-mono text-xs text-text-muted">
            <span>merge</span>
            <span className="text-border-subtle">→</span>
            <span>deduplicate</span>
            <span className="text-border-subtle">→</span>
            <span className="text-accent font-bold">score</span>
          </div>
        </m.div>
      </div>
    </section>
  );
}
