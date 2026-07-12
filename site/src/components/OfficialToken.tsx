import { m } from "framer-motion";
import { IconShieldCheck, IconArrowRight } from "./Icons";
import { SectionHeader } from "./SectionHeader";
import { TOKEN } from "../token";
import { stagger } from "../motion";

export function OfficialToken() {
  return (
    <section id="token" className="section-pad">
      <div className="page-container max-w-xl">
        <SectionHeader
          eyebrow="Official token"
          title={
            <>
              ${TOKEN.symbol} is launching on <span className="text-accent">Virtuals</span>
            </>
          }
          description="No contract is live yet. The official address will be published here and on our X the moment it launches — anything before that is not us."
        />

        <m.div {...stagger(0)} className="card-surface card-interactive p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <IconShieldCheck size={20} className="text-scan shrink-0" />
            <span className="font-mono text-sm font-semibold">
              ${TOKEN.symbol} · {TOKEN.launchpad}
            </span>
            <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-md verdict-warn tracking-wide">
              {TOKEN.status.toUpperCase()}
            </span>
          </div>

          <p className="section-eyebrow !text-text-muted !normal-case !tracking-wide mb-2">
            Contract address
          </p>
          <div className="bg-bg-elevated/80 border border-border-subtle rounded-lg px-4 py-3 mb-5">
            <code className="font-mono text-[12px] sm:text-[13px] break-all leading-relaxed block text-text-muted">
              Not live yet — reveal at launch
            </code>
          </div>

          <div className="grid gap-2.5">
            <a href={TOKEN.x} target="_blank" rel="noopener" className="btn-primary">
              Follow for the launch
              <IconArrowRight size={16} />
            </a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
