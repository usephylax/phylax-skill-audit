/** Shared motion presets — spring-based for smooth feel. */
export const spring = { type: "spring" as const, stiffness: 280, damping: 26 };

export const springSoft = { type: "spring" as const, stiffness: 200, damping: 28 };

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" as const },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
});
