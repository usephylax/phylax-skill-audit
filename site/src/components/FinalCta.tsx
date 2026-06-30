import { m } from "framer-motion";
import { PhylaxLogo, IconArrowRight } from "./Icons";
import { stagger } from "../motion";

export function FinalCta() {
  return (
    <section className="section-pad !pt-0">
      <div className="page-container max-w-2xl">
        <m.div
          {...stagger(0)}
          className="card-surface card-interactive text-center px-6 py-10 sm:px-10 sm:py-12"
        >
          <PhylaxLogo size={40} className="mx-auto mb-5 opacity-90" />
          <h2 className="section-heading mb-3">
            Don&apos;t install <span className="text-accent">blind.</span>
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-7 leading-relaxed">
            Run Phylax before every skill install. Takes ~200ms.
          </p>
          <a
            href="https://www.npmjs.com/package/phylax-skill-audit"
            target="_blank"
            rel="noopener"
            className="btn-primary"
          >
            <span className="font-mono text-xs sm:text-sm">npm install phylax-skill-audit</span>
            <IconArrowRight size={16} />
          </a>
          <p className="mt-5 text-[11px] text-text-muted font-mono">
            v0.2.2 · MIT ·{" "}
            <a
              href="https://bankr.bot/agents/phylax"
              className="text-text-secondary hover:text-accent transition-colors"
            >
              Bankr
            </a>
          </p>
        </m.div>
      </div>
    </section>
  );
}
