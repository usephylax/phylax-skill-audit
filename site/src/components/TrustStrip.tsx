import { m } from "framer-motion";
import { IconReadOnly, IconStateless, IconVerdict, IconEvidence } from "./Icons";
import { stagger } from "../motion";

const principles = [
  { icon: IconReadOnly, title: "Read-only", desc: "Never modifies your environment" },
  { icon: IconStateless, title: "Stateless", desc: "No data stored between scans" },
  { icon: IconVerdict, title: "Deterministic", desc: "Same input → same output" },
  { icon: IconEvidence, title: "Evidence-first", desc: "Proof on every finding" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border-faint bg-bg-card/30">
      <div className="page-container py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {principles.map((p, i) => (
            <m.div
              key={p.title}
              {...stagger(i)}
              className="flex flex-col items-center text-center gap-2.5"
            >
              <div className="p-2 rounded-lg border border-border-subtle text-scan/90">
                <p.icon size={18} />
              </div>
              <div>
                <div className="font-mono text-[12px] font-semibold">{p.title}</div>
                <div className="text-[11px] text-text-muted mt-0.5 leading-snug max-w-[140px] mx-auto">
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
