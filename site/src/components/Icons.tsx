import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function wrap(children: React.ReactNode, props: IconProps) {
  const { size = 24, className, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      {...defaults}
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ─── Phylax Logo — Guardian shield + audit aperture ─── */
export function PhylaxLogo(props: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={props.size ?? 32}
      height={props.size ?? 32}
      className={props.className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Guardian shield */}
      <path
        d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Audit aperture — the scan/lock eye */}
      <circle cx="16" cy="14.5" r="5" stroke="#c4f82a" strokeWidth="1.8" />
      <circle cx="16" cy="14.5" r="1.6" fill="#c4f82a" stroke="none" />
      {/* Reticle ticks */}
      <line x1="16" y1="7" x2="16" y2="9.5" stroke="#c4f82a" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="19.5" x2="16" y2="22" stroke="#c4f82a" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="#c4f82a" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="#c4f82a" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ─── 1. Static Scan ─── */
export function IconStaticScan(props: IconProps) {
  return wrap(
    <>
      <line x1={4} y1={6} x2={14} y2={6} strokeWidth={1.5} />
      <line x1={4} y1={10} x2={11} y2={10} strokeWidth={1.5} opacity={0.6} />
      <line x1={4} y1={14} x2={16} y2={14} strokeWidth={1.5} opacity={0.4} />
      <line x1={4} y1={18} x2={9} y2={18} strokeWidth={1.5} opacity={0.3} />
      {/* Scan bracket */}
      <path d="M18 4v16" stroke="#3B82F6" strokeWidth={2} />
      <path d="M16 4h4" stroke="#3B82F6" strokeWidth={1.5} />
      <path d="M16 20h4" stroke="#3B82F6" strokeWidth={1.5} />
    </>,
    props
  );
}

/* ─── 2. Onchain Scan ─── */
export function IconOnchainScan(props: IconProps) {
  return wrap(
    <>
      {/* Hex node */}
      <path d="M12 3L5 7v8l7 4 7-4V7l-7-4z" strokeWidth={1.5} />
      {/* Center dot */}
      <circle cx={12} cy={11} r={2} stroke="#3B82F6" strokeWidth={1.5} />
      <circle cx={12} cy={11} r={0.8} fill="#3B82F6" stroke="none" />
      {/* Chain lines */}
      <line x1={5} y1={11} x2={9} y2={11} stroke="#3B82F6" strokeWidth={1} opacity={0.5} />
      <line x1={15} y1={11} x2={19} y2={11} stroke="#3B82F6" strokeWidth={1} opacity={0.5} />
      <line x1={12} y1={19} x2={12} y2={22} strokeWidth={1} opacity={0.3} />
    </>,
    props
  );
}

/* ─── 3. Endpoint Scan ─── */
export function IconEndpointScan(props: IconProps) {
  return wrap(
    <>
      <circle cx={12} cy={11} r={7} strokeWidth={1.5} />
      <ellipse cx={12} cy={11} rx={3} ry={7} strokeWidth={0.8} opacity={0.3} />
      <line x1={5} y1={11} x2={19} y2={11} strokeWidth={0.8} opacity={0.3} />
      {/* Request arrow */}
      <path d="M17 5l3-1-1 3" stroke="#3B82F6" strokeWidth={1.5} />
      <line x1={14.5} y1={3.5} x2={19} y2={5.5} stroke="#3B82F6" strokeWidth={1} opacity={0.4} />
      {/* URL bar */}
      <rect x={4} y={20} width={16} height={2} strokeWidth={1} opacity={0.3} />
    </>,
    props
  );
}

/* ─── 4. Verdict ─── */
export function IconVerdict(props: IconProps) {
  return wrap(
    <>
      <line x1={12} y1={4} x2={12} y2={14} strokeWidth={1.5} />
      <line x1={6} y1={8} x2={18} y2={8} strokeWidth={2} />
      <path d="M6 8l-2 5c0 1.5 4 1.5 4 0l-2-5" strokeWidth={1.2} />
      <path d="M18 8l-2 5c0 1.5 4 1.5 4 0l-2-5" strokeWidth={1.2} />
      <path d="M9 19h6" strokeWidth={2} />
      <path d="M10 14.5L9.5 19m4-4.5l.5 4.5" strokeWidth={1} opacity={0.5} />
      <path d="M10 21l1.5 1.5L15 19" stroke="#3B82F6" strokeWidth={2} />
    </>,
    props
  );
}

/* ─── 5. Read-only ─── */
export function IconReadOnly(props: IconProps) {
  return wrap(
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" strokeWidth={1.5} />
      <circle cx={12} cy={12} r={3} strokeWidth={1.5} />
      <circle cx={12} cy={12} r={1} fill="currentColor" stroke="none" />
      {/* Slash — no write */}
      <line x1={4} y1={20} x2={20} y2={4} stroke="#DC2626" strokeWidth={2} opacity={0.5} />
    </>,
    props
  );
}

/* ─── 6. Stateless ─── */
export function IconStateless(props: IconProps) {
  return wrap(
    <>
      <circle cx={12} cy={12} r={8} strokeWidth={1.5} strokeDasharray="3 3" />
      <path d="M6 10c2-2 4 2 6 0s4 2 6 0" strokeWidth={1.5} />
      <path d="M6 14c2-2 4 2 6 0s4 2 6 0" strokeWidth={1} opacity={0.4} />
      <line x1={10.5} y1={16} x2={13.5} y2={18} stroke="#DC2626" strokeWidth={1.5} opacity={0.6} />
      <line x1={13.5} y1={16} x2={10.5} y2={18} stroke="#DC2626" strokeWidth={1.5} opacity={0.6} />
    </>,
    props
  );
}

/* ─── 7. Evidence ─── */
export function IconEvidence(props: IconProps) {
  return wrap(
    <>
      <path d="M6 3h8l4 4v14H6V3z" strokeWidth={1.5} />
      <path d="M14 3v4h4" strokeWidth={1.2} opacity={0.5} />
      <line x1={8} y1={10} x2={14} y2={10} strokeWidth={1} opacity={0.3} />
      <line x1={8} y1={13} x2={12} y2={13} strokeWidth={1} opacity={0.3} />
      <circle cx={15} cy={16} r={3.5} stroke="#3B82F6" strokeWidth={1.5} />
      <line x1={17.5} y1={18.5} x2={20} y2={21} stroke="#3B82F6" strokeWidth={2} />
    </>,
    props
  );
}

/* ─── 8. x402 Payment ─── */
export function IconX402(props: IconProps) {
  return wrap(
    <>
      <circle cx={12} cy={12} r={8} strokeWidth={1.5} />
      <circle cx={12} cy={12} r={6} strokeWidth={0.7} opacity={0.2} />
      <text x={12} y={14} textAnchor="middle" fontSize={8} fontWeight={700} fontFamily="IBM Plex Mono, monospace" fill="currentColor" stroke="none">x4</text>
      <text x={12} y={19.5} textAnchor="middle" fontSize={4.5} fontFamily="IBM Plex Mono, monospace" fill="currentColor" stroke="none" opacity={0.5}>02</text>
      <path d="M18 4l2 2-2 2" stroke="#3B82F6" strokeWidth={1.2} />
      <line x1={15} y1={6} x2={19.5} y2={6} stroke="#3B82F6" strokeWidth={0.8} opacity={0.4} />
    </>,
    props
  );
}

/* ─── 9. Critical ─── */
export function IconCritical(props: IconProps) {
  return wrap(
    <>
      <path d="M12 2l9 9-9 9-9-9 9-9z" strokeWidth={1.5} />
      <path d="M12 6l5 5-5 5-5-5 5-5z" fill="currentColor" fillOpacity={0.06} strokeWidth={0.7} opacity={0.4} />
      <line x1={12} y1={9} x2={12} y2={13} stroke="#DC2626" strokeWidth={2.5} />
      <circle cx={12} cy={15.5} r={1} fill="#DC2626" stroke="none" />
    </>,
    props
  );
}

/* ─── 10. Rule YAML ─── */
export function IconRuleYaml(props: IconProps) {
  return wrap(
    <>
      <path d="M5 2h9l5 5v15H5V2z" strokeWidth={1.5} />
      <path d="M14 2v5h5" strokeWidth={1.2} opacity={0.5} />
      <path d="M8 8c-1 0-1.5.5-1.5 1.5S7 11 8 11s1.5.5 1.5 1.5-.5 1.5-1.5 1.5" strokeWidth={1.5} fill="none" />
      <path d="M16 8c1 0 1.5.5 1.5 1.5S17 11 16 11s-1.5.5-1.5 1.5.5 1.5 1.5 1.5" strokeWidth={1.5} fill="none" />
      <line x1={10} y1={11} x2={14} y2={11} stroke="#3B82F6" strokeWidth={1.2} />
    </>,
    props
  );
}

/* ─── Arrow Right ─── */
export function IconArrowRight(props: IconProps) {
  return wrap(
    <>
      <line x1={4} y1={12} x2={20} y2={12} strokeWidth={1.5} />
      <path d="M14 6l6 6-6 6" strokeWidth={1.5} />
    </>,
    props
  );
}

/* ─── Shield Check ─── */
export function IconShieldCheck(props: IconProps) {
  return wrap(
    <>
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" strokeWidth={1.5} />
      <path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth={2} />
    </>,
    props
  );
}

/* ─── Terminal ─── */
export function IconTerminal(props: IconProps) {
  return wrap(
    <>
      <rect x={2} y={3} width={20} height={18} rx={2} strokeWidth={1.5} />
      <path d="M6 9l4 3-4 3" strokeWidth={1.5} />
      <line x1={12} y1={15} x2={18} y2={15} strokeWidth={1.5} opacity={0.5} />
    </>,
    props
  );
}
