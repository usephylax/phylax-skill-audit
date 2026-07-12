import { m } from "framer-motion";
import { IconArrowRight } from "./Icons";
import { SectionHeader } from "./SectionHeader";
import { stagger } from "../motion";

type Severity = "critical" | "high" | "medium" | "low";

const severityColors: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
};

const rules = [
  { id: "PI-001", severity: "critical" as const, cat: "PI", desc: "Fund transfer instruction" },
  { id: "PI-002", severity: "critical" as const, cat: "PI", desc: "Override safety instructions" },
  { id: "SEC-001", severity: "critical" as const, cat: "SEC", desc: "Private key / seed request" },
  { id: "AGT-001", severity: "critical" as const, cat: "AGT", desc: "Unlimited spend approval" },
  { id: "AGT-002", severity: "high" as const, cat: "AGT", desc: "Auto-execute without confirmation" },
  { id: "CON-020", severity: "critical" as const, cat: "CON", desc: "Honeypot detection" },
  { id: "CON-010", severity: "high" as const, cat: "CON", desc: "Unlimited approval" },
  { id: "CON-011", severity: "high" as const, cat: "CON", desc: "Proxy + single owner" },
  { id: "X402-001", severity: "high" as const, cat: "X402", desc: "Invalid 402 schema" },
  { id: "X402-041", severity: "high" as const, cat: "X402", desc: "HTTP endpoint" },
];

export function RulesTable() {
  return (
    <section id="rules" className="section-pad !pt-0">
      <div className="page-container max-w-4xl">
        <SectionHeader
          eyebrow="Rule engine"
          title={
            <>
              <span className="text-accent">30+</span> open-source YAML rules
            </>
          }
          description="Every finding cites a rule ID. Full definitions in the repo."
          className="!mb-8"
        />

        <m.div {...stagger(0)} className="card-surface overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-bg-elevated/50 transition-colors"
              >
                <span className="font-mono text-[13px] text-accent w-16 shrink-0">{rule.id}</span>
                <span
                  className={`font-mono text-[11px] font-semibold uppercase w-16 shrink-0 ${severityColors[rule.severity]}`}
                >
                  {rule.severity}
                </span>
                <span className="font-mono text-[11px] text-text-muted w-10 shrink-0 hidden sm:inline">
                  {rule.cat}
                </span>
                <span className="text-[13px] text-text-secondary flex-1 min-w-0">{rule.desc}</span>
              </div>
            ))}
          </div>
        </m.div>

        <m.div {...stagger(1)} className="mt-5 text-center">
          <a
            href="https://github.com/usephylax/phylax-skill-audit/tree/main/rules"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-[13px] text-text-secondary hover:text-accent transition-colors"
          >
            View all rules on GitHub
            <IconArrowRight size={14} />
          </a>
        </m.div>
      </div>
    </section>
  );
}
