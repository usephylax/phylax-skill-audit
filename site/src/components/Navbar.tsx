import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { PhylaxLogo, IconShieldCheck, IconTerminal } from "./Icons";
import { springSoft } from "../motion";

const NAV = [
  { label: "Engines", href: "#engines" },
  { label: "Rules", href: "#rules" },
  { label: "Scoring", href: "#scoring" },
  { label: "Embed", href: "#embed" },
  { label: "Token", href: "#token" },
  { label: "Integrate", href: "#integration" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  return (
    <>
      <m.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springSoft, delay: 0.05 }}
        className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/85 backdrop-blur-xl border-b border-border-subtle"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <PhylaxLogo size={24} />
            <span className="font-mono font-bold text-sm tracking-tight">phylax</span>
          </a>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary rounded-md transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/usephylax/phylax-skill-audit"
              target="_blank"
              rel="noopener"
              className="p-2 text-text-muted hover:text-text-secondary transition-colors duration-300"
              aria-label="GitHub"
            >
              <IconTerminal size={16} />
            </a>
            <a
              href="#integration"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent/90 transition-all duration-300 hover:shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)]"
            >
              <IconShieldCheck size={14} />
              Start Auditing
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </m.nav>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 lg:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <m.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={springSoft}
              className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-3 right-3 card-surface p-2 shadow-2xl shadow-black/40"
            >
              {NAV.map((item, i) => (
                <m.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springSoft, delay: i * 0.04 }}
                  className="block px-4 py-3 text-[15px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
                >
                  {item.label}
                </m.a>
              ))}
              <a
                href="#integration"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 mx-2 mb-1 py-3 bg-accent text-white text-sm font-medium rounded-lg"
              >
                <IconShieldCheck size={16} />
                Start Auditing
              </a>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
