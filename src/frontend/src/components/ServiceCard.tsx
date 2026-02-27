import { Clock, Zap, Droplets, Construction, Wifi, Trash2, Wrench } from 'lucide-react';
import type { CivixaService } from '../types/civixa';
import { StatusBadge } from './StatusBadge';

function ServiceIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('water')) return <Droplets className="w-5 h-5" />;
  if (n.includes('electric') || n.includes('power')) return <Zap className="w-5 h-5" />;
  if (n.includes('road') || n.includes('traffic')) return <Construction className="w-5 h-5" />;
  if (n.includes('internet') || n.includes('network')) return <Wifi className="w-5 h-5" />;
  if (n.includes('waste') || n.includes('garbage')) return <Trash2 className="w-5 h-5" />;
  return <Wrench className="w-5 h-5" />;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface ServiceCardProps {
  service: CivixaService;
  index?: number;
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const iconColor = {
    Operational: 'text-operational',
    Warning: 'text-warning-status',
    Interrupted: 'text-interrupted',
  }[service.status];

  const iconBg = {
    Operational: 'bg-green-500/10',
    Warning: 'bg-amber-500/10',
    Interrupted: 'bg-red-500/10',
  }[service.status];

  return (
    <div
      className="glass-card p-5 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both', opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <ServiceIcon name={service.serviceName} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-tight">{service.serviceName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-1">{service.impact}</p>
          </div>
        </div>
        <StatusBadge status={service.status} size="sm" />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t border-white/5">
        <Clock className="w-3 h-3 shrink-0" />
        <span className="font-mono">{formatRelativeTime(service.lastUpdated)}</span>
      </div>
    </div>
  );
}
