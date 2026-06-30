import { useState } from "react";
import { m } from "framer-motion";
import { IconShieldCheck, IconArrowRight } from "./Icons";
import { TOKEN } from "../token";

export function OfficialToken() {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(TOKEN.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="token" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
            OFFICIAL TOKEN · BASE
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            One token. <span className="text-accent">Verify before you ape.</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Only the contract below is the official ${TOKEN.symbol} token on {TOKEN.chain}.
            Anything else is not us — cross-check on Basescan and our pinned post on X.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-bg-card border border-border-subtle rounded-lg p-7"
        >
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <IconShieldCheck size={22} />
            <span className="font-mono text-sm font-semibold">
              ${TOKEN.symbol} · {TOKEN.chain}
            </span>
            <span className="ml-auto font-mono text-[11px] px-2 py-0.5 rounded border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              OFFICIAL CA
            </span>
          </div>

          <div className="font-mono text-[11px] text-text-muted mb-2">CONTRACT ADDRESS</div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-bg-elevated border border-border-subtle rounded px-4 py-3 mb-5">
            <code className="font-mono text-[13px] text-text-primary break-all flex-1">
              {TOKEN.address}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              className="shrink-0 px-3 py-1.5 font-mono text-[11px] border border-border-subtle rounded text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={TOKEN.basescan}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-colors bg-accent text-white hover:bg-accent/90"
            >
              View on Basescan
              <IconArrowRight size={16} />
            </a>
            <a
              href={TOKEN.x}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-border-subtle text-text-secondary rounded text-sm hover:text-text-primary hover:border-text-muted transition-colors"
            >
              Confirm on X
            </a>
          </div>

          <p className="mt-5 text-[12px] text-text-muted leading-relaxed">
            Phylax audit tooling stays free and open source. This is the only official
            contract address — always verify on Basescan before you trade.
          </p>
        </m.div>
      </div>
    </section>
  );
}
