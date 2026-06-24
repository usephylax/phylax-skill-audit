import { m } from "framer-motion";
import { IconShieldCheck, IconArrowRight } from "./Icons";

// ── Official token config ────────────────────────────────────────────────────
// Set TOKEN_ADDRESS to the real launch address once deployed. While empty,
// the section renders a "coming soon" state instead of a fake address.
const TOKEN_ADDRESS = "0xd7e608d398b88fe3084b495e9b86de2db343cba3";
const TOKEN_SYMBOL = "PHYLAX";
const CHAIN = "Base";

export function OfficialToken() {
  const live = TOKEN_ADDRESS.length === 42;
  const basescan = live ? `https://basescan.org/token/${TOKEN_ADDRESS}` : "#";

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
            OFFICIAL TOKEN
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            One token. <span className="text-accent">Verify before you ape.</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Only the address below is the official ${TOKEN_SYMBOL} token. Anything
            else claiming to be Phylax is not us — verify on {CHAIN} before trading.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-bg-card border border-border-subtle rounded-lg p-7"
        >
          <div className="flex items-center gap-3 mb-5">
            <IconShieldCheck size={22} />
            <span className="font-mono text-sm font-semibold">
              ${TOKEN_SYMBOL} · {CHAIN}
            </span>
            <span
              className={`ml-auto font-mono text-[11px] px-2 py-0.5 rounded border ${
                live
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : "text-medium border-medium/30 bg-medium/10"
              }`}
            >
              {live ? "VERIFIED" : "LAUNCHING SOON"}
            </span>
          </div>

          <div className="font-mono text-[11px] text-text-muted mb-2">CONTRACT ADDRESS</div>
          <div className="flex items-center gap-3 bg-bg-elevated border border-border-subtle rounded px-4 py-3 mb-5">
            <code className="font-mono text-[13px] text-text-primary break-all">
              {live ? TOKEN_ADDRESS : "Official address posted here at launch."}
            </code>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={basescan}
              target="_blank"
              rel="noopener"
              aria-disabled={!live}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-colors ${
                live
                  ? "bg-accent text-white hover:bg-accent/90"
                  : "bg-bg-elevated text-text-muted pointer-events-none"
              }`}
            >
              View on Basescan
              <IconArrowRight size={16} />
            </a>
            <a
              href="https://x.com/usephylax"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-border-subtle text-text-secondary rounded text-sm hover:text-text-primary hover:border-text-muted transition-colors"
            >
              Confirm on X
            </a>
          </div>

          <p className="mt-5 text-[12px] text-text-muted leading-relaxed">
            Trading fees support ongoing development. Phylax stays free and open
            source. This is the only official contract — always cross-check it
            against our pinned post on X.
          </p>
        </m.div>
      </div>
    </section>
  );
}
