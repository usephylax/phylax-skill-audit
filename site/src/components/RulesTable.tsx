import { m } from "framer-motion";

type Severity = "critical" | "high" | "medium" | "low";

const severityColors: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
};

interface Rule {
  id: string;
  severity: Severity;
  category: string;
  description: string;
}

const rules: Rule[] = [
  { id: "PI-001", severity: "critical", category: "PI", description: "Embedded fund transfer instruction" },
  { id: "PI-002", severity: "critical", category: "PI", description: "Override safety / ignore instructions" },
  { id: "SEC-001", severity: "critical", category: "SEC", description: "Private key or seed phrase request" },
  { id: "CON-020", severity: "critical", category: "CON", description: "Honeypot / sell tax detection" },
  { id: "PI-003", severity: "high", category: "PI", description: "Transaction signing request" },
  { id: "SEC-003", severity: "high", category: "SEC", description: "Wallet unlock instruction" },
  { id: "CON-010", severity: "high", category: "CON", description: "Unlimited token approval" },
  { id: "CON-011", severity: "high", category: "CON", description: "Proxy contract + single EOA owner" },
  { id: "X402-001", severity: "high", category: "X402", description: "Invalid 402 payment schema" },
  { id: "X402-041", severity: "high", category: "X402", description: "HTTP endpoint (not HTTPS)" },
  { id: "PI-005", severity: "medium", category: "PI", description: "External code execution" },
  { id: "SEC-005", severity: "medium", category: "SEC", description: "Broad filesystem access" },
  { id: "CON-030", severity: "medium", category: "CON", description: "Unverified contract source" },
  { id: "X402-030", severity: "medium", category: "X402", description: "Price >5× market median" },
  { id: "MAN-003", severity: "medium", category: "MAN", description: "Slug mismatch with skill ID" },
  { id: "MAN-001", severity: "low", category: "MAN", description: "Missing required manifest field" },
  { id: "MAN-004", severity: "low", category: "MAN", description: "Empty frontmatter block" },
  { id: "X402-031", severity: "low", category: "X402", description: "Zero price endpoint" },
];

export function RulesTable() {
  return (
    <section id="rules" className="section-pad">
      <div className="max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
            RULE ENGINE
          </span>
          <h2 className="section-heading">
            <span className="text-accent">30+</span> rules across 6 categories
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Every rule is a YAML entry with severity, patterns, and description. No black boxes.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-surface overflow-hidden"
        >
          <div className="overflow-x-auto">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-12 gap-4 px-4 sm:px-5 py-3 border-b border-border-subtle font-mono text-[11px] text-text-muted tracking-wider">
            <div className="col-span-2">ID</div>
            <div className="col-span-2">SEVERITY</div>
            <div className="col-span-2">CATEGORY</div>
            <div className="col-span-6">DESCRIPTION</div>
          </div>

          <div className="divide-y divide-border-subtle">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="grid grid-cols-12 gap-4 px-5 py-3 hover:bg-bg-elevated transition-colors"
              >
                <div className="col-span-2 font-mono text-[13px] text-accent">{rule.id}</div>
                <div className="col-span-2">
                  <span className={`font-mono text-[12px] font-semibold ${severityColors[rule.severity]}`}>
                    {rule.severity}
                  </span>
                </div>
                <div className="col-span-2 font-mono text-[13px] text-text-muted">{rule.category}</div>
                <div className="col-span-6 text-[13px] text-text-secondary">{rule.description}</div>
              </div>
            ))}
          </div>
          </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
