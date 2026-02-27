// ─── CIVIXA Data Types ───────────────────────────────────────────────────────

export type ServiceStatus = 'Operational' | 'Warning' | 'Interrupted';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface CivixaLocation {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CivixaService {
  id: string;
  locationId: string;
  serviceName: string;
  status: ServiceStatus;
  impact: string;
  lastUpdated: string;
}

export interface CivixaReport {
  id: string;
  locationId: string;
  serviceId: string;
  area: string;
  description: string;
  contactEmail: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CivixaUser {
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isModerator: boolean;
  assignedLocationId?: string | null;
  mustChangePassword: boolean;
  token: string;
}

export interface CivixaAuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  locationId: string;
  createdAt: string;
}

export type CivixaSession = CivixaUser;
