import { m } from "framer-motion";
import { IconX402, IconArrowRight } from "./Icons";

const codeLines: { text: string; class?: string }[][] = [
  [
    { text: "import", class: "text-accent" },
    { text: " { audit } ", class: "text-text-primary" },
    { text: "from", class: "text-accent" },
    { text: ' "phylax-skill-audit"', class: "text-emerald-400" },
  ],
  [],
  [
    { text: "const", class: "text-accent" },
    { text: " result", class: "text-text-primary" },
    { text: " = ", class: "text-text-muted" },
    { text: "await", class: "text-accent" },
    { text: " audit", class: "text-emerald-400" },
    { text: "(", class: "text-text-muted" },
  ],
  [
    { text: "  skill_source", class: "text-text-primary" },
    { text: ": ", class: "text-text-muted" },
    { text: '"https://skills.example.com/SKILL.md"', class: "text-emerald-400" },
    { text: ",", class: "text-text-muted" },
  ],
  [
    { text: "  chain_id", class: "text-text-primary" },
    { text: ": ", class: "text-text-muted" },
    { text: "8453", class: "text-accent" },
    { text: ",", class: "text-text-muted" },
  ],
  [
    { text: "  mode", class: "text-text-primary" },
    { text: ": ", class: "text-text-muted" },
    { text: '"deep"', class: "text-emerald-400" },
    { text: ",", class: "text-text-muted" },
  ],
  [{ text: "});", class: "text-text-muted" }],
  [],
  [
    { text: "console.", class: "text-text-muted" },
    { text: "log", class: "text-emerald-400" },
    { text: "(result.", class: "text-text-muted" },
    { text: "verdict", class: "text-text-primary" },
    { text: ");", class: "text-text-muted" },
    { text: ' // "ALLOW" | "WARN" | "DENY"', class: "text-text-muted/50" },
  ],
  [
    { text: "console.", class: "text-text-muted" },
    { text: "log", class: "text-emerald-400" },
    { text: "(result.", class: "text-text-muted" },
    { text: "score", class: "text-text-primary" },
    { text: ");", class: "text-text-muted" },
    { text: " // 0–100", class: "text-text-muted/50" },
  ],
  [
    { text: "console.", class: "text-text-muted" },
    { text: "log", class: "text-emerald-400" },
    { text: "(result.", class: "text-text-muted" },
    { text: "findings", class: "text-text-primary" },
    { text: ");", class: "text-text-muted" },
    { text: " // [{ id, severity, evidence, ref }]", class: "text-text-muted/50" },
  ],
];

export function Integration() {
  return (
    <section id="integration" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
              INTEGRATION
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-balance">
              One function call. <span className="text-accent">Full audit.</span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Install from npm, import the audit function, or call the hosted HTTP API.
              Same deterministic engine everywhere — static scan, onchain checks, and x402
              endpoint validation with evidence on every finding.
            </p>

            <div className="bg-bg-card border border-border-subtle rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <IconX402 size={20} />
                <span className="font-mono text-[13px] font-semibold">Free &amp; open source</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-accent">$0</span>
                  <span className="text-[13px] text-text-muted font-mono">MIT licensed</span>
                </div>
                <div className="text-[13px] text-text-secondary">
                  Run it locally, in CI, or call the hosted API. No key required.
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["npm v0.2.2", "Base (8453)", "MIT · free", "SSRF-hardened API"].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-bg-elevated border border-border-subtle rounded font-mono text-[11px] text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://github.com/usephylax/phylax-skill-audit"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-[13px] text-accent hover:text-accent/80 transition-colors font-medium"
            >
              View full documentation
              <IconArrowRight size={16} />
            </a>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
                </div>
                <span className="ml-3 font-mono text-[11px] text-text-muted">audit.ts</span>
              </div>

              <div className="p-6 terminal-body overflow-x-auto">
                {codeLines.map((parts, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right pr-4 text-text-muted/30 select-none text-xs leading-6">
                      {i + 1}
                    </span>
                    {parts.length === 0 ? (
                      <span>&nbsp;</span>
                    ) : (
                      parts.map((p, j) => (
                        <span key={j} className={p.class}>{p.text}</span>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
