import { m } from "framer-motion";
import { PhylaxLogo, IconArrowRight } from "./Icons";

export function FinalCta() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="bg-bg-card border border-border-subtle rounded-lg p-12 md:p-16"
        >
          <div className="flex justify-center mb-6">
            <PhylaxLogo size={48} />
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
            Don't install <span className="text-accent">blind.</span>
          </h2>

          <p className="text-base text-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
            One malicious skill can drain your wallet in seconds.
            Run Phylax before every install. It takes 200ms.
          </p>

          <a
            href="https://www.npmjs.com/package/phylax-skill-audit"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-white font-semibold rounded hover:bg-accent/90 transition-colors"
          >
            <span className="font-mono text-sm">npm install phylax-skill-audit</span>
            <IconArrowRight size={18} />
          </a>

          <p className="mt-6 text-[12px] text-text-muted font-mono">
            phylax-skill-audit@0.2.2 · MIT · Base ·{" "}
            <a href="https://bankr.bot/agents/phylax" className="text-text-secondary hover:text-accent transition-colors">
              Bankr profile
            </a>
          </p>
        </m.div>
      </div>
    </section>
  );
}
