import { m } from "framer-motion";
import { IconX402, IconArrowRight } from "./Icons";
import { SectionHeader } from "./SectionHeader";
import { TerminalWindow } from "./TerminalWindow";
import { stagger } from "../motion";
import { X402 } from "../x402";

const tiers = [
  {
    name: "Fast",
    price: "Free",
    where: "usephylax.com/api/audit",
    detail: "Static scan, bytecode heuristics, x402 HEAD probes. CI & pre-install gates.",
  },
  {
    name: "Deep",
    price: `$${X402.deepPriceUsdc} USDC`,
    where: "x402 Cloud",
    detail: "Honeypot simulation on Robinhood Chain + full onchain checks. Paid per request.",
  },
];

export function X402Section() {
  return (
    <section id="x402" className="section-pad">
      <div className="page-container">
        <SectionHeader
          eyebrow="x402"
          title={
            <>
              Security layer for <span className="text-accent">skills & x402 APIs</span>
            </>
          }
          description={`${X402.tagline}. Phylax audits what you install and what you pay for — it does not compete with x402 Cloud hosting.`}
        />

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {tiers.map((tier, i) => (
            <m.div key={tier.name} {...stagger(i)} className="card-surface p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-mono text-sm font-bold">{tier.name} audit</span>
                <span className="tag-pill text-accent">{tier.price}</span>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-2">{tier.detail}</p>
              <p className="font-mono text-[11px] text-text-muted break-all">{tier.where}</p>
            </m.div>
          ))}
        </div>

        <m.div {...stagger(2)}>
          <TerminalWindow title="x402 · audit-deep">
            <div className="p-4 sm:p-5 terminal-body overflow-x-auto text-left">
              <div className="terminal-line text-text-muted text-[11px] mb-3">
                # Deploy once: x402 deploy → $0.05 USDC/request
              </div>
              <div className="terminal-line">
                <span className="text-accent">POST</span>
                <span className="text-emerald-400/90"> {X402.deepAuditUrl}</span>
              </div>
              <pre className="mt-3 text-[11px] sm:text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
{`{
  "skill_source": "owner/repo/SKILL.md",
  "chain_id": 4663
}`}
              </pre>
            </div>
          </TerminalWindow>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href={X402.terminal}
              target="_blank"
              rel="noopener"
              className="btn-primary !text-[13px]"
            >
              <IconX402 size={16} />
              x402 Terminal
              <IconArrowRight size={15} />
            </a>
            <a
              href={X402.docs}
              target="_blank"
              rel="noopener"
              className="btn-ghost !text-[13px]"
            >
              Deploy docs
            </a>
            <a href="#integration" className="btn-ghost !text-[13px]">
              Free fast API
            </a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
