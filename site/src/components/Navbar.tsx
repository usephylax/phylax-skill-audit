import { m } from "framer-motion";
import { PhylaxLogo, IconShieldCheck, IconTerminal } from "./Icons";

export function Navbar() {
  return (
    <m.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <PhylaxLogo size={24} />
          <span className="font-mono font-bold text-sm tracking-tight">
            phylax
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {["Engines", "Rules", "Scoring", "Token", "Integrate"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/usephylax/phylax-skill-audit"
            target="_blank"
            rel="noopener"
            className="p-1.5 text-text-muted hover:text-text-secondary transition-colors"
          >
            <IconTerminal size={16} />
          </a>
          <a
            href="#integration"
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-accent text-white text-[13px] font-medium rounded hover:bg-accent/90 transition-colors"
          >
            <IconShieldCheck size={14} />
            Start Auditing
          </a>
        </div>
      </div>
    </m.nav>
  );
}
