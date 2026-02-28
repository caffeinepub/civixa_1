import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { CivixaService, ServiceStatus } from "../types/civixa";
import { StatusBadge } from "./StatusBadge";

interface GroupServiceCardProps {
  label: string;
  icon: React.ReactNode;
  services: CivixaService[];
  index?: number;
}

function aggregateStatus(services: CivixaService[]): ServiceStatus {
  if (services.some((s) => s.status === "Interrupted")) return "Interrupted";
  if (services.some((s) => s.status === "Warning")) return "Warning";
  return "Operational";
}

const statusGlow: Record<string, string> = {
  Operational:
    "0 0 0 1px oklch(0.68 0.18 145 / 0.45), 0 0 24px oklch(0.68 0.18 145 / 0.15)",
  Warning:
    "0 0 0 1px oklch(0.72 0.18 60 / 0.45), 0 0 24px oklch(0.72 0.18 60 / 0.15)",
  Interrupted:
    "0 0 0 1px oklch(0.62 0.22 25 / 0.55), 0 0 24px oklch(0.62 0.22 25 / 0.2)",
};

export function GroupServiceCard({
  label,
  icon,
  services,
  index = 0,
}: GroupServiceCardProps) {
  const [hovered, setHovered] = useState(false);
  const status = aggregateStatus(services);

  const iconColor = {
    Operational: "text-operational",
    Warning: "text-warning-status",
    Interrupted: "text-interrupted",
  }[status];

  const iconBg = {
    Operational: "bg-green-500/10",
    Warning: "bg-amber-500/10",
    Interrupted: "bg-red-500/10",
  }[status];

  const rowStatusColor = (s: ServiceStatus) =>
    ({
      Operational: "text-operational",
      Warning: "text-warning-status",
      Interrupted: "text-interrupted",
    })[s];

  return (
    <article
      className="glass-card animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "both",
        opacity: 0,
        padding: hovered ? "1.5rem" : "1.25rem",
        boxShadow: hovered ? statusGlow[status] : "none",
        transform: hovered
          ? "scale(1.025) translateY(-2px)"
          : "scale(1) translateY(0)",
        transition:
          "padding 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, background 0.3s ease, border-color 0.3s ease",
        zIndex: hovered ? 10 : "auto",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
            style={{
              width: hovered ? "2.75rem" : "2.5rem",
              height: hovered ? "2.75rem" : "2.5rem",
              transition: "width 0.3s ease, height 0.3s ease",
            }}
          >
            {icon}
          </div>
          <div>
            <h3
              className="font-semibold text-foreground leading-tight"
              style={{
                fontSize: hovered ? "0.9rem" : "0.875rem",
                transition: "font-size 0.3s ease",
              }}
            >
              {label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {services.length} provider{services.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} size={hovered ? "md" : "sm"} />
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground"
            aria-hidden="true"
            style={{ transition: "transform 0.3s ease" }}
          >
            {hovered ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </div>
      </div>

      {/* Expanded list — slides in on hover */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: hovered ? `${services.length * 120}px` : "0px",
          opacity: hovered ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
          marginTop: hovered ? "1rem" : "0",
        }}
      >
        <div className="border-t border-white/8 pt-3 space-y-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="flex items-start justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <span
                  className={`text-xs font-medium leading-tight ${rowStatusColor(svc.status)}`}
                >
                  {svc.serviceName}
                </span>
                {(svc.status === "Warning" || svc.status === "Interrupted") && (
                  <div
                    style={{
                      marginTop: "0.3rem",
                      borderLeft:
                        svc.status === "Warning"
                          ? "2px solid oklch(0.72 0.18 60 / 0.6)"
                          : "2px solid oklch(0.62 0.22 25 / 0.6)",
                      background:
                        svc.status === "Warning"
                          ? "oklch(0.72 0.18 60 / 0.06)"
                          : "oklch(0.62 0.22 25 / 0.06)",
                      borderRadius: "0 4px 4px 0",
                      padding: "0.25rem 0.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color:
                          svc.status === "Warning"
                            ? "oklch(0.72 0.18 60)"
                            : "oklch(0.62 0.22 25)",
                        marginBottom: "0.1rem",
                      }}
                    >
                      Reason
                    </p>
                    {svc.description ? (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          lineHeight: 1.4,
                          color:
                            svc.status === "Warning"
                              ? "oklch(0.72 0.18 60)"
                              : "oklch(0.62 0.22 25)",
                        }}
                      >
                        {svc.description}
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          fontStyle: "italic",
                          color: "oklch(0.55 0.02 245)",
                        }}
                      >
                        No reason provided
                      </p>
                    )}
                  </div>
                )}
                {svc.status === "Operational" && svc.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {svc.description}
                  </p>
                )}
              </div>
              <StatusBadge status={svc.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
