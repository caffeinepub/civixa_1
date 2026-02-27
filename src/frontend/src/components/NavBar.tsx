import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { LogOut, ChevronDown, Shield, Cpu, KeyRound } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NavBarProps {
  selectedLocationId?: string;
  onLocationChange?: (id: string) => void;
  showLocationSelector?: boolean;
}

export function NavBar({ selectedLocationId, onLocationChange, showLocationSelector = false }: NavBarProps) {
  const { session, logout } = useSession();
  const { locations } = useData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    void navigate({ to: '/' });
    setMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (session?.isAdmin) return { label: 'Admin', color: 'text-amber-400' };
    if (session?.isModerator) return { label: 'Moderator', color: 'text-cyan-400' };
    return { label: 'User', color: 'text-muted-foreground' };
  };

  return (
    <nav
      className="sticky top-0 z-50 glass-card-solid border-b border-white/10"
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: 'oklch(0.72 0.16 195 / 0.15)', border: '1px solid oklch(0.72 0.16 195 / 0.4)' }}>
            <Cpu className="w-4 h-4" style={{ color: 'oklch(0.72 0.16 195)' }} />
          </div>
          <span className="civixa-title text-lg tracking-wider"
            style={{ color: 'oklch(0.72 0.16 195)', letterSpacing: '0.12em' }}>
            CIVIXA
          </span>
        </Link>

        {/* Location Selector */}
        {showLocationSelector && locations.length > 0 && (
          <div className="flex-1 max-w-xs hidden sm:block">
            <Select value={selectedLocationId ?? ''} onValueChange={onLocationChange}>
              <SelectTrigger className="h-9 glass-card border-white/15 text-sm">
                <SelectValue placeholder="Select a city…" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Staff Login (shown when not logged in) */}
          {!session && (
            <DropdownMenu open={staffMenuOpen} onOpenChange={setStaffMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-white/15 hover:bg-white/5 text-sm">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Staff Login</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => { void navigate({ to: '/login/admin' }); setStaffMenuOpen(false); }}>
                  <Shield className="w-4 h-4 mr-2 text-amber-400" />
                  Admin Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { void navigate({ to: '/login/moderator' }); setStaffMenuOpen(false); }}>
                  <Shield className="w-4 h-4 mr-2 text-cyan-400" />
                  Moderator Login
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {session ? (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: 'oklch(0.5 0.18 255 / 0.3)', color: 'oklch(0.72 0.16 195)' }}>
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm max-w-28 truncate">{session.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{session.name}</p>
                  <p className={`text-xs mt-0.5 ${getRoleBadge().color}`}>{getRoleBadge().label}</p>
                </div>
                {session.isAdmin && (
                  <DropdownMenuItem onClick={() => { void navigate({ to: '/admin' }); setMenuOpen(false); }}>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                {session.isModerator && (
                  <DropdownMenuItem onClick={() => { void navigate({ to: '/moderator' }); setMenuOpen(false); }}>
                    <Shield className="w-4 h-4 mr-2" />
                    Moderator Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
