import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CivixaService, ServiceStatus } from '../types/civixa';
import { StatusBadge } from './StatusBadge';

interface GroupServiceCardProps {
  label: string;
  icon: React.ReactNode;
  services: CivixaService[];
  index?: number;
}

function aggregateStatus(services: CivixaService[]): ServiceStatus {
  if (services.some((s) => s.status === 'Interrupted')) return 'Interrupted';
  if (services.some((s) => s.status === 'Warning')) return 'Warning';
  return 'Operational';
}

export function GroupServiceCard({ label, icon, services, index = 0 }: GroupServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = aggregateStatus(services);

  const iconColor = {
    Operational: 'text-operational',
    Warning: 'text-warning-status',
    Interrupted: 'text-interrupted',
  }[status];

  const iconBg = {
    Operational: 'bg-green-500/10',
    Warning: 'bg-amber-500/10',
    Interrupted: 'bg-red-500/10',
  }[status];

  const rowStatusColor = (s: ServiceStatus) =>
    ({
      Operational: 'text-operational',
      Warning: 'text-warning-status',
      Interrupted: 'text-interrupted',
    }[s]);

  return (
    <div
      className="glass-card p-5 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both', opacity: 0 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-tight">{label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {services.length} provider{services.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} size="sm" />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="mt-4 border-t border-white/8 pt-3 space-y-2">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between gap-2">
              <span className={`text-xs font-medium leading-tight ${rowStatusColor(svc.status)}`}>
                {svc.serviceName}
              </span>
              <StatusBadge status={svc.status} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
