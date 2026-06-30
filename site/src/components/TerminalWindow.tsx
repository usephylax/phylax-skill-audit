import type { ReactNode } from "react";

type Props = {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function TerminalWindow({ title, badge, children, className = "" }: Props) {
  return (
    <div className={`card-surface overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border-subtle bg-bg-elevated/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-text-muted/25" />
            <span className="w-2 h-2 rounded-full bg-text-muted/25" />
            <span className="w-2 h-2 rounded-full bg-text-muted/25" />
          </div>
          <span className="font-mono text-[11px] text-text-muted truncate">{title}</span>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}
