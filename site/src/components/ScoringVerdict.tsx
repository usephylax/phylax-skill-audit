import { m } from "framer-motion";

const verdicts = [
  {
    verdict: "ALLOW",
    score: "≥ 80",
    condition: "No critical or high findings",
    color: "text-emerald-400",
    desc: "Skill passes all checks. Safe to install with standard caution.",
  },
  {
    verdict: "WARN",
    score: "50–79",
    condition: "High findings present, no critical",
    color: "text-medium",
    desc: "Potential issues detected. Review findings before proceeding.",
  },
  {
    verdict: "DENY",
    score: "< 50",
    condition: "Any critical finding OR score < 50",
    color: "text-critical",
    desc: "Critical security issues found. Do not install this skill.",
  },
];

export function ScoringVerdict() {
  return (
    <section id="scoring" className="section-pad">
      <div className="max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
            SCORING
          </span>
          <h2 className="section-heading">
            The rules decide the verdict.
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Score starts at 100. Each finding subtracts its severity weight. No subjective thresholds.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-8 py-5 bg-bg-card border border-border-subtle rounded-lg font-mono">
            <span className="text-text-muted">score</span>
            <span className="text-accent mx-2">=</span>
            <span className="text-text-primary">100</span>
            <span className="text-text-muted mx-2">−</span>
            <span className="text-text-primary">Σ(severity_weight × hits)</span>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-6 text-[13px] font-mono">
            <span className="text-critical">critical: 40</span>
            <span className="text-high">high: 20</span>
            <span className="text-medium">medium: 10</span>
            <span className="text-low">low: 3</span>
          </div>
        </m.div>

        <div className="grid md:grid-cols-3 gap-5">
          {verdicts.map((v, i) => (
            <m.div
              key={v.verdict}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-surface card-interactive p-6 sm:p-7 text-center"
            >
              <div className={`font-mono text-3xl font-extrabold ${v.color} mb-2`}>{v.verdict}</div>
              <div className="font-mono text-[13px] text-text-muted mb-1">score {v.score}</div>
              <div className="text-[12px] text-text-secondary mb-4">{v.condition}</div>
              <p className="text-[13px] text-text-secondary leading-relaxed">{v.desc}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
