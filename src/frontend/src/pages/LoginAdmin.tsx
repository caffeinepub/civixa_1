import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackgroundLayout } from "../components/BackgroundLayout";
import { useSession } from "../context/SessionContext";

export function LoginAdmin() {
  const { login } = useSession();
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
    const ok = login(email.trim(), "admin");
    if (ok) {
      toast.success("Admin access granted");
      void navigate({ to: "/admin" });
    } else {
      toast.error("Admin credentials not found");
    }
    setLoading(false);
  };

  return (
    <BackgroundLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: "oklch(0.72 0.18 60 / 0.1)",
                border: "1px solid oklch(0.72 0.18 60 / 0.3)",
              }}
            >
              <Shield
                className="w-7 h-7"
                style={{ color: "oklch(0.72 0.18 60)" }}
              />
            </div>
            <h1
              className="civixa-title text-2xl"
              style={{ color: "oklch(0.72 0.18 60)", letterSpacing: "0.08em" }}
            >
              CIVIXA Admin
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              System Administrator Access
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-lg font-semibold mb-6">Admin Login</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Admin Email</Label>
                <Input
                  type="email"
                  placeholder="admin@civixa.local"
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
                style={{
                  background: "oklch(0.72 0.18 60)",
                  color: "oklch(0.12 0.02 60)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </span>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Are you a Moderator?{" "}
              <Link
                to="/login/moderator"
                className="text-cyan-400 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}
