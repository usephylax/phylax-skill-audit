import { m } from "framer-motion";
import { IconReadOnly, IconStateless, IconVerdict, IconEvidence } from "./Icons";

const principles = [
  {
    icon: IconReadOnly,
    title: "Read-only",
    desc: "Never modifies your skill or environment",
  },
  {
    icon: IconStateless,
    title: "Stateless",
    desc: "No data stored between scans",
  },
  {
    icon: IconVerdict,
    title: "Deterministic",
    desc: "Same input → same verdict, always",
  },
  {
    icon: IconEvidence,
    title: "Evidence-first",
    desc: "Every finding includes proof",
  },
];

export function TrustStrip() {
  return (
    <section className="py-16 border-y border-border-subtle">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {principles.map((p, i) => (
            <m.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="p-2.5 border border-border-subtle rounded">
                <p.icon size={20} />
              </div>
              <div>
                <div className="font-mono text-[13px] font-semibold text-text-primary">
                  {p.title}
                </div>
                <div className="text-[12px] text-text-muted mt-1 leading-relaxed max-w-[160px]">
                  {p.desc}
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
