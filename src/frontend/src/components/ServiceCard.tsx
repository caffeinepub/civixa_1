import { useState } from 'react';
import { Clock, Zap, Droplets, Construction, Wifi, Trash2, Wrench, Building2 } from 'lucide-react';
import type { CivixaService } from '../types/civixa';
import { StatusBadge } from './StatusBadge';

function ServiceIcon({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const n = name.toLowerCase();
  if (n.includes('water')) return <Droplets className={cls} />;
  if (n.includes('electric') || n.includes('power')) return <Zap className={cls} />;
  if (n.includes('road') || n.includes('traffic')) return <Construction className={cls} />;
  if (n.includes('internet') || n.includes('network')) return <Wifi className={cls} />;
  if (n.includes('waste') || n.includes('garbage')) return <Trash2 className={cls} />;
  if (n.includes('government') || n.includes('office')) return <Building2 className={cls} />;
  return <Wrench className={cls} />;
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

const statusGlow: Record<string, string> = {
  Operational: '0 0 0 1px oklch(0.68 0.18 145 / 0.45), 0 0 24px oklch(0.68 0.18 145 / 0.15)',
  Warning: '0 0 0 1px oklch(0.72 0.18 60 / 0.45), 0 0 24px oklch(0.72 0.18 60 / 0.15)',
  Interrupted: '0 0 0 1px oklch(0.62 0.22 25 / 0.55), 0 0 24px oklch(0.62 0.22 25 / 0.2)',
};

interface ServiceCardProps {
  service: CivixaService;
  index?: number;
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);

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
    <article
      className="glass-card animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'both',
        opacity: 0,
        padding: hovered ? '1.5rem' : '1.25rem',
        boxShadow: hovered ? statusGlow[service.status] : 'none',
        transform: hovered ? 'scale(1.025) translateY(-2px)' : 'scale(1) translateY(0)',
        transition:
          'padding 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
        zIndex: hovered ? 10 : 'auto',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
            style={{
              width: hovered ? '2.75rem' : '2.5rem',
              height: hovered ? '2.75rem' : '2.5rem',
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
          >
            <ServiceIcon name={service.serviceName} />
          </div>
          <div>
            <h3
              className="font-semibold text-foreground leading-tight"
              style={{
                fontSize: hovered ? '0.9rem' : '0.875rem',
                transition: 'font-size 0.3s ease',
              }}
            >
              {service.serviceName}
            </h3>
            <p
              className="text-muted-foreground mt-0.5 leading-tight"
              style={{
                fontSize: '0.75rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: hovered ? 'unset' : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {service.impact}
            </p>
          </div>
        </div>
        <StatusBadge status={service.status} size={hovered ? 'md' : 'sm'} />
      </div>

      {/* Description */}
      {service.description && (
        <div
          style={{
            overflow: 'hidden',
            maxHeight: hovered ? '200px' : '2.6em',
            transition: 'max-height 0.35s ease',
          }}
        >
          <p
            className="text-muted-foreground leading-relaxed px-0.5"
            style={{ fontSize: '0.75rem' }}
          >
            {service.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center gap-1.5 text-muted-foreground pt-3 border-t border-white/5"
        style={{
          fontSize: '0.75rem',
          marginTop: hovered ? '0.875rem' : '0.75rem',
          transition: 'margin-top 0.3s ease',
        }}
      >
        <Clock className="w-3 h-3 shrink-0" />
        <span className="font-mono">{formatRelativeTime(service.lastUpdated)}</span>
        {hovered && (
          <span className="ml-auto text-xs opacity-50 font-mono">
            {new Date(service.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </article>
  );
}
