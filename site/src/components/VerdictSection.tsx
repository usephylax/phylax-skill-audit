import { m } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { TerminalWindow } from "./TerminalWindow";
import { stagger } from "../motion";

const verdicts = [
  {
    verdict: "ALLOW",
    score: "≥ 80",
    condition: "No critical or high findings",
    className: "verdict-allow",
    desc: "Safe to install with standard caution.",
  },
  {
    verdict: "WARN",
    score: "50–79",
    condition: "Medium/high, no critical",
    className: "verdict-warn",
    desc: "Review findings before proceeding.",
  },
  {
    verdict: "DENY",
    score: "< 50",
    condition: "Any critical finding",
    className: "verdict-deny",
    desc: "Do not install this skill.",
  },
] as const;

const jsonLines = [
  '{',
  '  "verdict": "DENY",',
  '  "score": 0,',
  '  "findings": [',
  '    { "id": "PI-001", "severity": "critical",',
  '      "evidence": "transfer all USDC..." },',
  '    { "id": "SEC-001", "severity": "critical",',
  '      "evidence": "provide your private key..." }',
  "  ]",
  "}",
];

export function VerdictSection() {
  return (
    <section id="scoring" className="section-pad">
      <div className="page-container">
        <SectionHeader
          eyebrow="Verdict"
          title={
            <>
              Deterministic <span className="text-accent">ALLOW · WARN · DENY</span>
            </>
          }
          description="Score starts at 100. Rule hits subtract severity weights. Every finding ships with evidence — no black boxes."
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <div className="card-surface p-5 sm:p-6 mb-6 text-center">
              <p className="font-mono text-sm sm:text-base text-text-secondary">
                <span className="text-text-muted">score</span>
                <span className="text-accent mx-2">=</span>
                <span className="text-text-primary">100</span>
                <span className="text-text-muted mx-2">−</span>
                <span className="text-text-primary">Σ(weight × hits)</span>
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] font-mono">
                <span className="text-critical">critical −40</span>
                <span className="text-high">high −20</span>
                <span className="text-medium">medium −10</span>
                <span className="text-low">low −3</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {verdicts.map((v, i) => (
                <m.div
                  key={v.verdict}
                  {...stagger(i)}
                  className="card-surface card-interactive p-4 sm:p-5 text-center"
                >
                  <div
                    className={`inline-block font-mono text-lg sm:text-xl font-extrabold px-2.5 py-1 rounded-md mb-2 ${v.className}`}
                  >
                    {v.verdict}
                  </div>
                  <div className="font-mono text-[11px] text-text-muted mb-1">score {v.score}</div>
                  <p className="text-[12px] text-text-secondary leading-snug">{v.desc}</p>
                </m.div>
              ))}
            </div>
          </div>

          <m.div {...stagger(1)}>
            <TerminalWindow
              title="audit-output.json"
              badge={
                <span className="font-mono text-[10px] px-2 py-0.5 rounded verdict-deny">
                  DENY
                </span>
              }
            >
              <div className="p-4 sm:p-5 terminal-body overflow-x-auto">
                {jsonLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-6 text-right pr-3 text-text-muted/30 select-none text-[11px]">
                      {i + 1}
                    </span>
                    <span
                      className={
                        line.includes("critical") || line.includes("DENY")
                          ? "text-critical/90"
                          : line.includes('"id"')
                            ? "text-accent/90"
                            : "text-text-secondary"
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </TerminalWindow>
            <p className="mt-3 text-[12px] text-text-muted text-center lg:text-left">
              Machine-readable JSON with rule IDs, severity, and file references.
            </p>
          </m.div>
        </div>
      </div>
    </section>
  );
}
