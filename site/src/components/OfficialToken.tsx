import { useState } from "react";
import { m } from "framer-motion";
import { IconShieldCheck, IconArrowRight } from "./Icons";
import { SectionHeader } from "./SectionHeader";
import { TOKEN } from "../token";
import { stagger } from "../motion";

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
      <div className="page-container max-w-xl">
        <SectionHeader
          eyebrow="Official token"
          title={
            <>
              Now live on <span className="text-accent">Robinhood Chain</span>
            </>
          }
          description="Only the contract below is official $PHYLAX. Anything else is not us."
        />

        <m.div {...stagger(0)} className="card-surface card-interactive p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <IconShieldCheck size={20} className="text-scan shrink-0" />
            <span className="font-mono text-sm font-semibold">
              ${TOKEN.symbol} · {TOKEN.chain}
            </span>
            <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-md verdict-allow tracking-wide">
              LIVE
            </span>
          </div>

          <p className="section-eyebrow !text-text-muted !normal-case !tracking-wide mb-2">
            Contract address
          </p>
          <div className="bg-bg-elevated/80 border border-border-subtle rounded-lg px-4 py-3 mb-5">
            <code className="font-mono text-[12px] sm:text-[13px] break-all leading-relaxed block">
              {TOKEN.address}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              className="mt-2 text-[11px] font-mono text-text-muted hover:text-accent transition-colors"
            >
              {copied ? "Copied ✓" : "Copy address"}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            <a href={TOKEN.explorer} target="_blank" rel="noopener" className="btn-primary">
              View on Explorer
              <IconArrowRight size={16} />
            </a>
            <a href={TOKEN.x} target="_blank" rel="noopener" className="btn-ghost">
              Confirm on X
            </a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
