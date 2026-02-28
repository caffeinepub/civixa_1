import { cn } from "@/lib/utils";
import type React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  solid?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  solid = false,
  onClick,
}: GlassCardProps) {
  const base = cn(solid ? "glass-card-solid" : "glass-card", "p-6", className);

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(base, "w-full text-left")}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}
