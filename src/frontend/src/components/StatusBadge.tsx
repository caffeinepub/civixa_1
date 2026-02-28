import type { ServiceStatus } from "../types/civixa";

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const dotClass = {
    Operational: "status-dot-operational",
    Warning: "status-dot-warning",
    Interrupted: "status-dot-interrupted",
  }[status];

  const badgeClass = {
    Operational: "status-operational",
    Warning: "status-warning",
    Interrupted: "status-interrupted",
  }[status];

  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${textSize} ${padding} ${badgeClass}`}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <span className={`rounded-full shrink-0 ${dotSize} ${dotClass}`} />
      {status}
    </span>
  );
}
