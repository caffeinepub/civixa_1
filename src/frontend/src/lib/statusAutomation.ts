import type { CivixaReport, ServiceStatus } from "../types/civixa";

/**
 * Compute new service status based on approved reports in recent windows.
 */
export function computeServiceStatus(
  serviceId: string,
  allReports: CivixaReport[],
): ServiceStatus {
  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;
  const twoHoursAgo = now - 2 * 60 * 60 * 1000;

  const recentApproved = allReports.filter(
    (r) =>
      r.serviceId === serviceId &&
      r.status === "approved" &&
      new Date(r.createdAt).getTime() >= thirtyMinutesAgo,
  );

  const count = recentApproved.length;

  if (count >= 3) return "Interrupted";
  if (count >= 1) return "Warning";

  // Check if any approved report in last 2 hours
  const recentAny = allReports.filter(
    (r) =>
      r.serviceId === serviceId &&
      r.status === "approved" &&
      new Date(r.createdAt).getTime() >= twoHoursAgo,
  );

  if (recentAny.length === 0) return "Operational";

  return "Operational";
}
