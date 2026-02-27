import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Eye, EyeOff, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { useSession } from '../context/SessionContext';
import { toast } from 'sonner';

export function LoginModerator() {
  const { login } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const ok = login(email.trim(), 'moderator');
    if (ok) {
      toast.success('Moderator access granted');
      void navigate({ to: '/moderator' });
    } else {
      toast.error('Moderator credentials not found');
    }
    setLoading(false);
  };

  return (
    <BackgroundLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'oklch(0.72 0.16 195 / 0.1)', border: '1px solid oklch(0.72 0.16 195 / 0.3)' }}>
              <UserCheck className="w-7 h-7" style={{ color: 'oklch(0.72 0.16 195)' }} />
            </div>
            <h1 className="civixa-title text-2xl" style={{ color: 'oklch(0.72 0.16 195)', letterSpacing: '0.08em' }}>
              CIVIXA Moderator
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Location Moderator Access</p>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-lg font-semibold mb-6">Moderator Login</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Moderator Email</Label>
                <Input
                  type="email"
                  placeholder="mod@civixa.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin(); }}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin(); }}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                className="w-full mt-2"
                onClick={() => void handleLogin()}
                disabled={loading}
                style={{ background: 'oklch(0.72 0.16 195)', color: 'oklch(0.08 0.02 195)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Moderator Login
                  </span>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Are you an Admin?{' '}
              <Link to="/login/admin" className="text-cyan-400 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}
