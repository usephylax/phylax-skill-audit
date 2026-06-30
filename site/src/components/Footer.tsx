import { PhylaxLogo } from "./Icons";
import { TOKEN, shortenAddress } from "../token";

const LINKS = [
  { label: "GitHub", href: "https://github.com/usephylax/phylax-skill-audit" },
  { label: "npm", href: "https://www.npmjs.com/package/phylax-skill-audit" },
  { label: "Bankr", href: "https://bankr.bot/agents/phylax" },
  { label: "Badge", href: "#embed" },
  { label: "Basescan", href: TOKEN.basescan },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <PhylaxLogo size={20} />
            <span className="font-mono font-semibold text-[13px] text-text-secondary">phylax</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-text-muted font-mono flex-wrap justify-center">
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
          </div>

          <div className="text-center md:text-right">
            <div className="text-[11px] text-text-muted font-mono">
              Official ${TOKEN.symbol} · {shortenAddress(TOKEN.address, 8, 6)}
            </div>
            <div className="text-[11px] text-text-muted font-mono mt-1">
              © {new Date().getFullYear()} Phylax · Pre-install security for agent skills
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
