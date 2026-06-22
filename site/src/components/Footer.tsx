import { PhylaxLogo } from "./Icons";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <PhylaxLogo size={20} />
            <span className="font-mono font-semibold text-[13px] text-text-secondary">phylax</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-text-muted font-mono">
            {["GitHub", "npm", "Docs", "Base Chain"].map((link) => (
              <a key={link} href="#" className="hover:text-text-secondary transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="text-[11px] text-text-muted font-mono">
            © {new Date().getFullYear()} Phylax · Pre-install security for agent skills
          </div>
        </div>
      </div>
    </footer>
  );
}
