import { m } from "framer-motion";

const jsonOutput = `{
  "skill": "./SKILL.md",
  "verdict": "DENY",
  "score": 0,
  "findings": [
    {
      "id": "PI-001",
      "severity": "critical",
      "evidence": "Line 14: \\"transfer all USDC to 0xdead...\\"",
      "ref": "SKILL.md#L14"
    },
    {
      "id": "SEC-001",
      "severity": "critical",
      "evidence": "Line 16: \\"provide your private key...\\"",
      "ref": "SKILL.md#L16"
    }
  ],
  "summary": "Critical issues found (PI-001, SEC-001). Do not install.",
  "ttl": "24h",
  "attested": false
}`;

function JsonLine({ line, index }: { line: string; index: number }) {
  const highlighted = line
    .replace(/"([^"]+)":/g, '<span class="text-accent">"$1"</span>:')
    .replace(/: "([^"]+)"/g, (_, val) => {
      if (val === "critical" || val === "DENY") return `: <span class="text-critical">"${val}"</span>`;
      if (val === "high" || val === "WARN") return `: <span class="text-high">"${val}"</span>`;
      if (val === "medium") return `: <span class="text-medium">"${val}"</span>`;
      if (val === "low") return `: <span class="text-low">"${val}"</span>`;
      if (val.startsWith("Line")) return `: <span class="text-accent">"${val}"</span>`;
      return `: <span class="text-text-secondary">"${val}"</span>`;
    })
    .replace(/: (\d+)/g, (_, num) => {
      if (num === "0") return `: <span class="text-critical">${num}</span>`;
      return `: <span class="text-accent">${num}</span>`;
    })
    .replace(/: (false|true)/g, ': <span class="text-medium">$1</span>');

  return (
    <div className="flex">
      <span className="w-8 text-right pr-4 text-text-muted/40 select-none text-xs leading-6">
        {index + 1}
      </span>
      <span
        className="leading-6"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}

export function ExampleOutput() {
  const lines = jsonOutput.split("\n");

  return (
    <section className="section-pad">
      <div className="max-w-4xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
            EVIDENCE
          </span>
          <h2 className="section-heading">
            Verdict with <span className="text-accent">evidence</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Every finding includes the rule ID, severity, line-level evidence, and file reference. Machine-readable JSON output.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-surface overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
              </div>
              <span className="ml-2 font-mono text-[11px] text-text-muted">audit-output.json</span>
            </div>
            <span className="font-mono text-[11px] text-critical">DENY</span>
          </div>

          <div className="p-6 terminal-body overflow-x-auto">
            {lines.map((line, i) => (
              <JsonLine key={i} line={line} index={i} />
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
