import { m } from "framer-motion";
import { IconX402, IconArrowRight } from "./Icons";
import { SectionHeader } from "./SectionHeader";
import { TerminalWindow } from "./TerminalWindow";
import { stagger } from "../motion";

const badgeUrl = "https://usephylax.com/api/badge?skill=usephylax/phylax-skill-audit";

const codeLines = [
  'import { audit } from "phylax-skill-audit"',
  "",
  'const result = await audit({',
  '  skill_source: "owner/repo/SKILL.md",',
  "  chain_id: 8453,",
  '  mode: "fast",',
  "});",
  "",
  'console.log(result.verdict); // ALLOW | WARN | DENY',
];

const snippets = [
  {
    label: "Badge",
    code: `[![Phylax](${badgeUrl})](https://usephylax.com)`,
  },
  {
    label: "API",
    code: `curl -X POST https://usephylax.com/api/audit \\\n  -d '{"skill_source":"owner/repo","mode":"fast"}'`,
  },
];

export function DevelopersSection() {
  return (
    <section id="integration" className="section-pad">
      <div className="page-container">
        <SectionHeader
          eyebrow="Developers"
          title={
            <>
              npm, API, <span className="text-accent">embed badge</span>
            </>
          }
          description="Fast mode is free (CLI + API). Deep mode ($0.05 USDC) on Bankr x402 Cloud — honeypot simulation on Base."
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <m.div {...stagger(0)}>
            <TerminalWindow title="audit.ts">
              <div className="p-4 sm:p-5 terminal-body overflow-x-auto">
                {codeLines.map((line, i) => (
                  <div key={i} className="leading-7">
                    {line === "" ? (
                      <span>&nbsp;</span>
                    ) : line.startsWith("import") ? (
                      <>
                        <span className="text-accent">import</span>
                        <span className="text-emerald-400"> {"{ audit }"} </span>
                        <span className="text-accent">from</span>
                        <span className="text-emerald-400"> "phylax-skill-audit"</span>
                      </>
                    ) : line.startsWith("const") ? (
                      <>
                        <span className="text-accent">const</span>
                        <span className="text-text-primary"> result</span>
                        <span className="text-text-muted"> = </span>
                        <span className="text-accent">await</span>
                        <span className="text-emerald-400"> audit</span>
                        <span className="text-text-muted">({"{"}</span>
                      </>
                    ) : line.startsWith("console") ? (
                      <span className="text-text-muted">{line}</span>
                    ) : line === "});" ? (
                      <span className="text-text-muted">{line}</span>
                    ) : (
                      <span className="text-text-secondary">{line}</span>
                    )}
                  </div>
                ))}
              </div>
            </TerminalWindow>

            <div className="mt-5 flex flex-wrap gap-2">
              {["npm v0.2.4", "Base 8453", "SSRF-hardened"].map((t) => (
                <span key={t} className="tag-pill">
                  {t}
                </span>
              ))}
            </div>

            <a
              href="https://github.com/usephylax/phylax-skill-audit"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 mt-5 text-[13px] text-accent hover:opacity-80 transition-opacity font-medium"
            >
              Full documentation
              <IconArrowRight size={15} />
            </a>
          </m.div>

          <m.div {...stagger(1)} id="embed" className="space-y-4">
            <div className="card-surface card-interactive p-5 sm:p-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 w-full">
                <IconX402 size={18} />
                <span className="font-mono text-[12px] text-text-secondary">Live badge preview</span>
              </div>
              <img
                src={badgeUrl}
                alt="Phylax verdict badge"
                width={200}
                height={20}
                className="rounded"
              />
            </div>

            {snippets.map((s) => (
              <div key={s.label} className="card-surface overflow-hidden">
                <div className="px-4 py-2 border-b border-border-subtle font-mono text-[11px] text-text-muted">
                  {s.label}
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-[11px] sm:text-[12px] text-emerald-400/85 leading-relaxed whitespace-pre-wrap break-all">
                  {s.code}
                </pre>
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
}
