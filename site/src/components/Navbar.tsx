import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { PhylaxLogo, IconShieldCheck } from "./Icons";
import { springSoft } from "../motion";

const NAV = [
  { label: "How it works", href: "#engines" },
  { label: "Verdict", href: "#scoring" },
  { label: "Developers", href: "#integration" },
  { label: "x402", href: "#x402" },
  { label: "Token", href: "#token" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
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
    document.body.style.overflow = "hidden";
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <m.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
        className="fixed top-0 left-0 right-0 z-40 border-b border-border-faint bg-bg-primary/80 backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="page-container h-14 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2 shrink-0">
            <PhylaxLogo size={22} />
            <span className="font-mono font-bold text-sm">phylax</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
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

          <div className="flex items-center gap-2">
            <a href="#integration" className="hidden sm:inline-flex btn-primary !py-1.5 !px-4 !text-[13px]">
              <IconShieldCheck size={14} />
              Start
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              aria-label={open ? "Close menu" : "Open menu"}
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
            className="fixed inset-0 z-30 md:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springSoft}
              className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-3 right-3 card-surface p-2 shadow-2xl"
            >
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-[15px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
