import { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NavBar } from '../components/NavBar';
import { ServiceCard } from '../components/ServiceCard';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { useData } from '../context/DataContext';

export function Home() {
  const { locations, services, refresh } = useData();

  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => {
    const locs = locations;
    return locs[0]?.id ?? '';
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);
  const locationServices = services.filter((s) => s.locationId === selectedLocationId);

  const operationalCount = locationServices.filter((s) => s.status === 'Operational').length;
  const warningCount = locationServices.filter((s) => s.status === 'Warning').length;
  const interruptedCount = locationServices.filter((s) => s.status === 'Interrupted').length;

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleManualRefresh = () => {
    refresh();
    setLastRefresh(new Date());
  };

  const overallStatus = interruptedCount > 0 ? 'Interrupted' : warningCount > 0 ? 'Degraded' : 'All Systems Operational';
  const overallStatusColor = interruptedCount > 0 ? 'text-interrupted' : warningCount > 0 ? 'text-warning-status' : 'text-operational';

  return (
    <BackgroundLayout>
      <NavBar
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        showLocationSelector
      />

      <main className="max-w-7xl mx-auto px-4 pb-24">
        {/* Hero Section */}
        <section className="pt-16 pb-12 text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both', opacity: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ background: 'oklch(0.72 0.16 195 / 0.1)', border: '1px solid oklch(0.72 0.16 195 / 0.3)', color: 'oklch(0.72 0.16 195)' }}>
              <Activity className="w-3 h-3" />
              Live Infrastructure Status
            </div>
          </div>

          <h1
            className="civixa-title text-5xl sm:text-7xl mb-4 animate-fade-in-up cyan-glow"
            style={{
              animationDelay: '0.15s',
              animationFillMode: 'both',
              opacity: 0,
              color: 'oklch(0.72 0.16 195)',
              letterSpacing: '-0.04em',
            }}
          >
            CIVIXA
          </h1>

          <p
            className="text-lg text-muted-foreground max-w-md mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both', opacity: 0 }}
          >
            Real-time Civic Infrastructure Status
          </p>
        </section>

        {/* Location Selector (Mobile) */}
        <div className="sm:hidden mb-6">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="glass-card border-white/15">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select a city…" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Header + Stats */}
        {selectedLocation && (
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: '0.25s', animationFillMode: 'both', opacity: 0 }}
          >
            <div className="glass-card p-5 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">{selectedLocation.name}</h2>
                  </div>
                  <p className={`text-sm font-medium ${overallStatusColor}`}>{overallStatus}</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <Stat count={operationalCount} label="Operational" color="text-operational" />
                  <div className="w-px h-8 bg-white/10" />
                  <Stat count={warningCount} label="Warning" color="text-warning-status" />
                  <div className="w-px h-8 bg-white/10" />
                  <Stat count={interruptedCount} label="Interrupted" color="text-interrupted" />
                  <div className="w-px h-8 bg-white/10" />

                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="font-mono">{lastRefresh.toLocaleTimeString()}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {selectedLocation ? (
          locationServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
              {locationServices.map((svc, i) => (
                <ServiceCard key={svc.id} service={svc} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState message="No services configured for this location." />
          )
        ) : (
          <EmptyState message="Select a city above to view infrastructure status." />
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-muted-foreground">
        <p>© 2026. Built with ♥ using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            caffeine.ai
          </a>
        </p>
      </footer>
    </BackgroundLayout>
  );
}

function Stat({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold font-mono ${color}`}>{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
