import { m } from "framer-motion";
import { PhylaxLogo, IconArrowRight } from "./Icons";
import { TOKEN, shortenAddress } from "../token";
import { springSoft } from "../motion";

function AuditConsole() {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSoft, delay: 0.45 }}
      className="w-full max-w-3xl mx-auto mt-10 sm:mt-16"
    >
      <div className="card-surface card-interactive overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40" />
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-text-muted truncate">
              phylax audit
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot shrink-0" />
        </div>

        <div className="p-3 sm:p-5 terminal-body text-[11px] sm:text-[13px] overflow-x-auto">
          <div className="terminal-line whitespace-nowrap sm:whitespace-normal">
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
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springSoft, delay: 0.7 + i * 0.12 }}
              className="terminal-line"
            >
              <span className="text-accent">▸</span>
              <span className="terminal-output">{line}</span>
            </m.div>
          ))}

          <div className="my-3 border-t border-dashed border-border-subtle" />

          <m.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springSoft, delay: 1.2 }}
            className="flex items-center gap-2 sm:gap-3 flex-wrap font-mono"
          >
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] sm:text-xs font-bold border border-green-500/20 rounded">
              ALLOW
            </span>
            <span className="text-text-muted hidden sm:inline">│</span>
            <span className="text-text-secondary">score:</span>
            <span className="text-accent font-bold">100</span>
            <span className="text-text-muted hidden sm:inline">│</span>
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
    <section className="pt-[calc(5.5rem+env(safe-area-inset-top))] pb-14 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springSoft}
          className="inline-flex items-center gap-2 px-3 py-1 border border-border-subtle rounded-full mb-6 sm:mb-8"
        >
          <PhylaxLogo size={14} />
          <span className="font-mono text-[10px] sm:text-[11px] text-text-muted tracking-wider">
            PRE-INSTALL SECURITY · BASE
          </span>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.08 }}
          className="text-[2rem] leading-[1.12] sm:text-5xl md:text-7xl font-extrabold tracking-tight text-balance"
        >
          Audit agent skills
          <br />
          <span className="text-accent">before they drain your wallet.</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.14 }}
          className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed text-balance px-1"
        >
          Phylax scans SKILL.md, manifests, onchain contracts, and x402
          endpoints — then returns deterministic verdicts with evidence.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.18 }}
          className="mt-5 sm:mt-6"
        >
          <a
            href="#token"
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-500/25 bg-emerald-500/5 rounded-full font-mono text-[10px] sm:text-[11px] text-emerald-400/90 hover:border-emerald-500/45 transition-all duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Official ${TOKEN.symbol} · {shortenAddress(TOKEN.address)}
          </a>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.22 }}
          className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 px-2 sm:px-0"
        >
          <a href="#integration" className="btn-primary">
            Get Started
            <IconArrowRight size={16} />
          </a>
          <a href="#engines" className="btn-ghost">
            How It Works
          </a>
        </m.div>

        <AuditConsole />
      </div>
    </section>
  );
}
