import { PhylaxLogo } from "./Icons";
import { TOKEN, shortenAddress } from "../token";

const LINKS = [
  { label: "GitHub", href: "https://github.com/usephylax/phylax-skill-audit" },
  { label: "npm", href: "https://www.npmjs.com/package/phylax-skill-audit" },
  { label: "x402", href: "#x402" },
  { label: "API", href: "#integration" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border-faint pb-[env(safe-area-inset-bottom)]">
      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <PhylaxLogo size={18} />
            <span className="font-mono text-[12px] text-text-secondary">phylax</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-mono text-text-muted">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener" : undefined}
                className="hover:text-text-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-[11px] text-text-muted font-mono text-center sm:text-right">
            ${TOKEN.symbol} · {shortenAddress(TOKEN.address, 6, 4)}
          </p>
        </div>
      </div>
    </footer>
  );
}
