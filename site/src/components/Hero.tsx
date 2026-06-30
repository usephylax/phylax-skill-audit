import { m } from "framer-motion";
import { PhylaxLogo, IconArrowRight } from "./Icons";
import { TOKEN, shortenAddress } from "../token";

function AuditConsole() {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full max-w-3xl mx-auto mt-16"
    >
      <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
            </div>
            <span className="font-mono text-[11px] text-text-muted">phylax audit</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
        </div>

        {/* Body */}
        <div className="p-5 terminal-body">
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <span>phylax --skill ./SKILL.md --mode deep</span>
          </div>
          {[
            "Loading rules from /rules/*.yaml",
            "Running static scan...",
            "Running onchain scan (Base 8453)...",
            "Running endpoint scan...",
          ].map((line, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
              className="terminal-line"
            >
              <span className="text-accent">▸</span>
              <span className="terminal-output">{line}</span>
            </m.div>
          ))}

          <div className="my-3 border-t border-dashed border-border-subtle" />

          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex items-center gap-3 flex-wrap font-mono"
          >
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 rounded">
              ALLOW
            </span>
            <span className="text-text-muted">│</span>
            <span className="text-text-secondary">score:</span>
            <span className="text-accent font-bold">100</span>
            <span className="text-text-muted">│</span>
            <span className="text-text-secondary">findings:</span>
            <span>0</span>
          </m.div>

          <div className="mt-3 flex items-center gap-2">
            <span className="terminal-prompt">$</span>
            <span className="w-2 h-4 bg-accent/70 cursor-blink" />
          </div>
        </div>
      </div>
    </m.div>
  );
}

export function Hero() {
  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 border border-border-subtle rounded mb-8"
        >
          <PhylaxLogo size={14} />
          <span className="font-mono text-[11px] text-text-muted tracking-wider">
            PRE-INSTALL SECURITY · BASE CHAIN
          </span>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-balance"
        >
          Audit agent skills
          <br />
          <span className="text-accent">before they drain your wallet.</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed text-balance"
        >
          Phylax scans SKILL.md, manifests, onchain contracts, and x402
          endpoints — then returns deterministic verdicts with evidence.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6"
        >
          <a
            href="#token"
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-500/25 bg-emerald-500/5 rounded font-mono text-[11px] text-emerald-400/90 hover:border-emerald-500/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Official ${TOKEN.symbol} · {shortenAddress(TOKEN.address)} · Verify CA
          </a>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#integration"
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-medium rounded text-sm hover:bg-accent/90 transition-colors"
          >
            Get Started
            <IconArrowRight size={16} />
          </a>
          <a
            href="#engines"
            className="flex items-center gap-2 px-6 py-2.5 border border-border-subtle text-text-secondary rounded text-sm hover:text-text-primary hover:border-text-muted transition-colors"
          >
            How It Works
          </a>
        </m.div>

        <AuditConsole />
      </div>
    </section>
  );
}
