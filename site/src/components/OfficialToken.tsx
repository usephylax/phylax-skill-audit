import { useState } from "react";
import { m } from "framer-motion";
import { IconShieldCheck, IconArrowRight } from "./Icons";
import { TOKEN } from "../token";
import { fadeUp, springSoft } from "../motion";

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
    <section id="token" className="section-pad">
      <div className="max-w-3xl mx-auto">
        <m.div {...fadeUp} className="text-center mb-8 md:mb-10">
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-3 md:mb-4">
            OFFICIAL TOKEN
          </span>
          <h2 className="section-heading">
            One token. <span className="text-accent">Verify before you ape.</span>
          </h2>
          <p className="mt-3 md:mt-4 text-text-secondary max-w-xl mx-auto text-sm sm:text-base leading-relaxed px-1">
            Only the address below is the official ${TOKEN.symbol} token. Anything else
            claiming to be Phylax is not us — verify on Bankr before you trade.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ ...springSoft, delay: 0.08 }}
          className="card-surface glow-border p-5 sm:p-7"
        >
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <IconShieldCheck size={22} className="text-scan shrink-0" />
            <span className="font-mono text-sm font-semibold">
              ${TOKEN.symbol} · {TOKEN.chain}
            </span>
            <span className="ml-auto font-mono text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md border text-emerald-400 border-emerald-500/30 bg-emerald-500/10 tracking-wide">
              VERIFIED
            </span>
          </div>

          <div className="font-mono text-[11px] text-text-muted mb-2 tracking-wide">
            CONTRACT ADDRESS
          </div>
          <div className="flex flex-col gap-2 bg-bg-elevated border border-border-subtle rounded-lg px-3 sm:px-4 py-3 mb-5">
            <code className="font-mono text-[12px] sm:text-[13px] text-text-primary break-all leading-relaxed">
              {TOKEN.address}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              className="self-start sm:self-end px-3 py-1.5 font-mono text-[11px] border border-border-subtle rounded-md text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all duration-300 active:scale-95"
            >
              {copied ? "Copied ✓" : "Copy address"}
            </button>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <a
              href={TOKEN.bankr}
              target="_blank"
              rel="noopener"
              className="btn-primary w-full sm:flex-1"
            >
              View on Bankr
              <IconArrowRight size={16} />
            </a>
            <a
              href={TOKEN.x}
              target="_blank"
              rel="noopener"
              className="btn-ghost w-full sm:flex-1"
            >
              Confirm on X
            </a>
          </div>

          <p className="mt-5 text-[11px] sm:text-[12px] text-text-muted leading-relaxed text-center sm:text-left">
            Trading fees support Phylax development. Always cross-check this contract against
            our{" "}
            <a
              href={TOKEN.bankr}
              target="_blank"
              rel="noopener"
              className="text-text-secondary hover:text-accent transition-colors"
            >
              Bankr agent profile
            </a>{" "}
            and pinned post on X before you trade.
          </p>
        </m.div>
      </div>
    </section>
  );
}
