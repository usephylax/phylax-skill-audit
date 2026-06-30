import { m } from "framer-motion";
import { PhylaxLogo, IconArrowRight } from "./Icons";
import { TOKEN, shortenAddress } from "../token";
import { TerminalWindow } from "./TerminalWindow";
import { springSoft } from "../motion";

const scanLines = [
  "Loading rules from /rules/*.yaml",
  "Running static scan...",
  "Running onchain scan (Base 8453)...",
  "Running endpoint scan...",
];

export function Hero() {
  return (
    <section className="pt-[calc(5rem+env(safe-area-inset-top))] pb-12 sm:pb-16">
      <div className="page-container max-w-3xl text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSoft}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-card/50 mb-6"
        >
          <PhylaxLogo size={14} />
          <span className="font-mono text-[10px] sm:text-[11px] text-text-muted tracking-wider">
            PRE-INSTALL SECURITY · BASE
          </span>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.06 }}
          className="text-[1.875rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-balance"
        >
          Audit agent skills
          <br />
          <span className="text-accent">before they touch your wallet.</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.12 }}
          className="mt-4 text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed"
        >
          Scans SKILL.md, contracts, and x402 endpoints — returns a deterministic
          verdict with evidence.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.18 }}
          className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5"
        >
          <a href="#integration" className="btn-primary w-full sm:w-auto">
            Get Started
            <IconArrowRight size={16} />
          </a>
          <a href="#engines" className="btn-ghost w-full sm:w-auto">
            How it works
          </a>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.28 }}
          className="mt-8"
        >
          <a
            href="#token"
            className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-400/80 hover:text-emerald-400 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            ${TOKEN.symbol} · {shortenAddress(TOKEN.address)}
          </a>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.36 }}
          className="mt-10 sm:mt-12 max-w-2xl mx-auto"
        >
          <TerminalWindow
            title="phylax audit"
            badge={<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />}
          >
            <div className="p-4 sm:p-5 terminal-body text-left overflow-x-auto">
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span>phylax --skill ./SKILL.md</span>
              </div>
              {scanLines.map((line) => (
                <div key={line} className="terminal-line">
                  <span className="text-scan/80">▸</span>
                  <span className="terminal-output">{line}</span>
                </div>
              ))}
              <div className="my-3 border-t border-dashed border-border-subtle" />
              <div className="flex items-center gap-2 flex-wrap font-mono text-[11px] sm:text-xs">
                <span className="px-2 py-0.5 rounded-md verdict-allow font-bold">ALLOW</span>
                <span className="text-text-muted">score</span>
                <span className="text-accent font-bold">100</span>
                <span className="text-text-muted">· findings</span>
                <span>0</span>
              </div>
            </div>
          </TerminalWindow>
        </m.div>
      </div>
    </section>
  );
}
