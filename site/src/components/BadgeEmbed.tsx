import { m } from "framer-motion";
import { IconArrowRight } from "./Icons";

const badgeUrl = "https://usephylax.com/api/badge?skill=usephylax/phylax-skill-audit";
const auditUrl = "https://usephylax.com/api/audit";

const snippets = [
  {
    label: "Verdict badge (Markdown)",
    code: `[![Phylax verdict](${badgeUrl})](https://usephylax.com)`,
  },
  {
    label: "Verdict badge (HTML)",
    code: `<img src="${badgeUrl}" alt="Phylax skill audit verdict" width="180" height="20" />`,
  },
  {
    label: "Quick audit (curl)",
    code: `curl "https://usephylax.com/api/audit?skill=owner/repo/SKILL.md"`,
  },
  {
    label: "Full audit (POST)",
    code: `curl -X POST ${auditUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"skill_source":"owner/repo","mode":"fast"}'`,
  },
];

export function BadgeEmbed() {
  return (
    <section id="embed" className="section-pad">
      <div className="max-w-4xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-mono text-[11px] text-text-muted tracking-wider mb-4">
            EMBED &amp; API
          </span>
          <h2 className="section-heading">
            Drop a badge. <span className="text-accent">Get a verdict.</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base">
            Embed an SVG badge in your README or call the hosted API — same engine as the CLI,
            no API key required. Rate-limited to 20 req/min per IP.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex flex-col items-center gap-4 mb-10 p-5 sm:p-6 card-surface card-interactive"
        >
          <span className="font-mono text-[11px] text-text-muted">LIVE PREVIEW</span>
          <img
            src={badgeUrl}
            alt="Phylax verdict badge preview"
            width={200}
            height={20}
            className="rounded"
          />
          <a
            href={badgeUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-[12px] text-accent hover:text-accent/80 font-mono"
          >
            Open badge URL
            <IconArrowRight size={14} />
          </a>
        </m.div>

        <div className="space-y-4">
          {snippets.map((s, i) => (
            <m.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden"
            >
              <div className="px-4 py-2 border-b border-border-subtle font-mono text-[11px] text-text-muted">
                {s.label}
              </div>
              <pre className="p-4 overflow-x-auto font-mono text-[12px] text-emerald-400/90 leading-relaxed whitespace-pre-wrap break-all">
                {s.code}
              </pre>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
