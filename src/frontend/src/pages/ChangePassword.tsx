import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackgroundLayout } from "../components/BackgroundLayout";
import { useSession } from "../context/SessionContext";

export function ChangePassword() {
  const { session, updateSession } = useSession();
  const navigate = useNavigate();
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!session) {
    void navigate({ to: "/" });
    return null;
  }

  const handleSubmit = async () => {
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    updateSession({ mustChangePassword: false });
    toast.success("Password updated successfully");

    if (session.isAdmin) void navigate({ to: "/admin" });
    else if (session.isModerator) void navigate({ to: "/moderator" });
    else void navigate({ to: "/" });
    setLoading(false);
  };

  return (
    <BackgroundLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: "oklch(0.5 0.18 255 / 0.1)",
                border: "1px solid oklch(0.5 0.18 255 / 0.3)",
              }}
            >
              <KeyRound
                className="w-7 h-7"
                style={{ color: "oklch(0.72 0.16 195)" }}
              />
            </div>
            <h1 className="text-xl font-semibold">Change Password</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Required before first use
            </p>
          </div>

          <div className="glass-card p-8">
            <div
              className="p-3 rounded-lg mb-6 text-xs"
              style={{
                background: "oklch(0.72 0.18 60 / 0.08)",
                border: "1px solid oklch(0.72 0.18 60 / 0.2)",
                color: "oklch(0.72 0.18 60)",
              }}
            >
              For security, please set a new password before continuing.
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="pr-10"
                    autoFocus
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

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSubmit();
                  }}
                />
                {confirmPw && newPw !== confirmPw && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                className="w-full mt-2"
                onClick={() => void handleSubmit()}
                disabled={loading || !newPw || !confirmPw}
                style={{ background: "oklch(0.5 0.18 255)", color: "white" }}
              >
                {loading ? "Updating…" : "Set New Password"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}
