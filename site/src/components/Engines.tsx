import { m } from "framer-motion";
import { IconStaticScan, IconOnchainScan, IconEndpointScan } from "./Icons";
import { SectionHeader } from "./SectionHeader";
import { stagger } from "../motion";

const engines = [
  {
    icon: IconStaticScan,
    title: "Static",
    desc: "SKILL.md & manifest — injection, secret exfiltration, obfuscation.",
    tags: ["PI-*", "SEC-*", "MAN-*"],
  },
  {
    icon: IconOnchainScan,
    title: "Onchain",
    desc: "Bytecode on Robinhood Chain — approvals, proxies, honeypot simulation.",
    tags: ["CON-*", "LIQ-*"],
  },
  {
    icon: IconEndpointScan,
    title: "Endpoint",
    desc: "x402 payment URLs — HTTPS, schema, redirects, price sanity.",
    tags: ["X402-*"],
  },
];

export function Engines() {
  return (
    <section id="engines" className="section-pad !pb-8 md:!pb-12">
      <div className="page-container">
        <SectionHeader
          eyebrow="Scan engines"
          title={
            <>
              Three layers. <span className="text-accent">One verdict.</span>
            </>
          }
          description="Independent scanners merge findings into a single deterministic score."
        />

        <div className="grid md:grid-cols-3 gap-4">
          {engines.map((eng, i) => (
            <m.article
              key={eng.title}
              {...stagger(i)}
              className="card-surface card-interactive p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg border border-border-subtle bg-bg-elevated/50">
                  <eng.icon size={18} />
                </div>
                <h3 className="font-mono text-xs font-bold tracking-widest uppercase text-text-primary">
                  {eng.title}
                </h3>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">{eng.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {eng.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  );
}
