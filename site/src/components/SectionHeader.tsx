import type { ReactNode } from "react";
import { m } from "framer-motion";
import { fadeUp } from "../motion";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: Props) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <m.header {...fadeUp} className={`mb-10 md:mb-14 max-w-2xl ${alignClass} ${className}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-heading mt-3">{title}</h2>
      {description && (
        <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
    </m.header>
  );
}
