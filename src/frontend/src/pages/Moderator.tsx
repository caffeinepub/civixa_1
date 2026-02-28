import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  ScrollText,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BackgroundLayout } from "../components/BackgroundLayout";
import { NavBar } from "../components/NavBar";
import { useData } from "../context/DataContext";
import { useSession } from "../context/SessionContext";

export function Moderator() {
  const {
    locations,
    services,
    reports,
    auditLogs,
    approveReport,
    rejectReport,
  } = useData();
  const { session } = useSession();

  const assignedLoc = session?.assignedLocationId
    ? locations.find((l) => l.id === session.assignedLocationId)
    : null;

  const locId = assignedLoc?.id ?? "";

  const pendingReports = reports.filter(
    (r) => r.locationId === locId && r.status === "pending",
  );

  const locationAuditLogs = auditLogs.filter((l) => l.locationId === locId);

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.serviceName ?? serviceId;
  };

  const handleApprove = (reportId: string) => {
    approveReport(reportId);
    toast.success("Report approved — service status updated");
  };

  const handleReject = (reportId: string) => {
    rejectReport(reportId);
    toast.success("Report rejected");
  };

  return (
    <BackgroundLayout>
      <div className="min-h-screen overflow-x-hidden">
        <NavBar />

        <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "oklch(0.72 0.16 195 / 0.1)",
                border: "1px solid oklch(0.72 0.16 195 / 0.3)",
              }}
            >
              <UserCheck
                className="w-5 h-5"
                style={{ color: "oklch(0.72 0.16 195)" }}
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Moderator Panel</h1>
              <p className="text-xs text-muted-foreground">
                {session?.name} ·{" "}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {assignedLoc?.name ?? "No location assigned"}
                </span>
              </p>
            </div>
          </div>

          <Tabs defaultValue="reports">
            <TabsList
              className="mb-6"
              style={{ background: "oklch(0.18 0.03 245)" }}
            >
              <TabsTrigger value="reports" className="gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pending Reports
                {pendingReports.length > 0 && (
                  <Badge
                    className="ml-1.5 text-xs px-1.5 py-0 h-4 rounded-full"
                    style={{
                      background: "oklch(0.5 0.18 255)",
                      color: "white",
                    }}
                  >
                    {pendingReports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-1.5 text-xs">
                <ScrollText className="w-3.5 h-3.5" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            {/* Pending Reports */}
            <TabsContent value="reports">
              {pendingReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle2
                    className="w-12 h-12 text-muted-foreground mb-4 opacity-30"
                    style={{ color: "oklch(0.68 0.18 145)" }}
                  />
                  <p className="font-medium text-sm">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No pending reports for{" "}
                    {assignedLoc?.name ?? "your location"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      serviceName={getServiceName(report.serviceId)}
                      onApprove={() => handleApprove(report.id)}
                      onReject={() => handleReject(report.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Audit Log */}
            <TabsContent value="audit">
              <div className="glass-card-solid rounded-xl overflow-hidden">
                {locationAuditLogs.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No audit logs for this location yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {locationAuditLogs.slice(0, 50).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-4">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ background: "oklch(0.72 0.16 195)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">
                            {log.action}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {log.performedByName}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BackgroundLayout>
  );
}

interface ReportCardProps {
  report: {
    id: string;
    area: string;
    description: string;
    contactEmail: string;
    createdAt: string;
  };
  serviceName: string;
  onApprove: () => void;
  onReject: () => void;
}

function ReportCard({
  report,
  serviceName,
  onApprove,
  onReject,
}: ReportCardProps) {
  return (
    <div className="glass-card p-5 animate-slide-in">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs status-warning">
              {serviceName}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                background: "oklch(0.5 0.18 255 / 0.1)",
                color: "oklch(0.72 0.16 195)",
                borderColor: "oklch(0.5 0.18 255 / 0.2)",
              }}
            >
              {report.area}
            </Badge>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span>{report.contactEmail}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="gap-1.5 text-xs border-white/15 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            className="gap-1.5 text-xs"
            style={{ background: "oklch(0.68 0.18 145)", color: "white" }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
