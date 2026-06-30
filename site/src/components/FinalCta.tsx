import { m } from "framer-motion";
import { PhylaxLogo, IconArrowRight } from "./Icons";
import { fadeUp, springSoft } from "../motion";

export function FinalCta() {
  return (
    <section className="section-pad">
      <div className="max-w-3xl mx-auto text-center px-1">
        <m.div
          {...fadeUp}
          className="card-surface glow-border p-8 sm:p-12 md:p-16"
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={springSoft}
            className="flex justify-center mb-5 sm:mb-6"
          >
            <PhylaxLogo size={44} />
          </m.div>

          <h2 className="section-heading mb-4 sm:mb-5">
            Don't install <span className="text-accent">blind.</span>
          </h2>

          <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto mb-7 sm:mb-8 leading-relaxed">
            One malicious skill can drain your wallet in seconds.
            Run Phylax before every install. It takes 200ms.
          </p>

          <a
            href="https://www.npmjs.com/package/phylax-skill-audit"
            target="_blank"
            rel="noopener"
            className="btn-primary px-6 sm:px-8 py-3 font-semibold"
          >
            <span className="font-mono text-xs sm:text-sm">npm install phylax-skill-audit</span>
            <IconArrowRight size={18} />
          </a>

          <p className="mt-5 sm:mt-6 text-[11px] sm:text-[12px] text-text-muted font-mono leading-relaxed">
            phylax-skill-audit@0.2.2 · MIT · Base ·{" "}
            <a
              href="https://bankr.bot/agents/phylax"
              className="text-text-secondary hover:text-accent transition-colors duration-300"
            >
              Bankr profile
            </a>
          </p>
        </m.div>
      </div>
    </section>
  );
}
