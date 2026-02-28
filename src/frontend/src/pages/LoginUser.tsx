import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Cpu, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackgroundLayout } from "../components/BackgroundLayout";

export function LoginUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    // User login is no longer supported — redirect to home
    toast.info("Public access — no login required");
    void navigate({ to: "/" });
    setLoading(false);
  };

  return (
    <BackgroundLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 cyan-border-glow"
              style={{
                background: "oklch(0.72 0.16 195 / 0.1)",
                border: "1px solid oklch(0.72 0.16 195 / 0.3)",
              }}
            >
              <Cpu
                className="w-7 h-7"
                style={{ color: "oklch(0.72 0.16 195)" }}
              />
            </div>
            <h1
              className="civixa-title text-3xl cyan-glow"
              style={{ color: "oklch(0.72 0.16 195)", letterSpacing: "0.1em" }}
            >
              CIVIXA
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Civic Infrastructure Status
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-lg font-semibold mb-6">Community Login</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleLogin();
                  }}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleLogin();
                    }}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="w-full mt-2"
                onClick={() => void handleLogin()}
                disabled={loading}
                style={{ background: "oklch(0.5 0.18 255)", color: "white" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </span>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Are you Admin or Moderator?{" "}
              <Link to="/login/admin" className="text-cyan-400 hover:underline">
                Access staff login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}
