// ─── localStorage Keys ────────────────────────────────────────────────────────
export const KEYS = {
  SESSION: 'civixaSession',
  LOCATIONS: 'civixaLocations',
  SERVICES: 'civixaServices',
  REPORTS: 'civixaReports',
  USERS: 'civixaUsers',
  AUDIT_LOGS: 'civixaAuditLogs',
  LAST_REPORT_TIME: 'civixaLastReportTime',
} as const;

import type {
  CivixaLocation,
  CivixaService,
  CivixaReport,
  CivixaUser,
  CivixaAuditLog,
  CivixaSession,
} from '../types/civixa';

// ─── Generic Helpers ─────────────────────────────────────────────────────────
function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Session ─────────────────────────────────────────────────────────────────
export function getSession(): CivixaSession | null {
  return getItem<CivixaSession>(KEYS.SESSION);
}

export function setSession(session: CivixaSession): void {
  setItem(KEYS.SESSION, session);
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.SESSION);
}

// ─── Locations ───────────────────────────────────────────────────────────────
export function getLocations(): CivixaLocation[] {
  return getItem<CivixaLocation[]>(KEYS.LOCATIONS) ?? [];
}

export function setLocations(locs: CivixaLocation[]): void {
  setItem(KEYS.LOCATIONS, locs);
}

// ─── Services ────────────────────────────────────────────────────────────────
export function getServices(): CivixaService[] {
  return getItem<CivixaService[]>(KEYS.SERVICES) ?? [];
}

export function setServices(svcs: CivixaService[]): void {
  setItem(KEYS.SERVICES, svcs);
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export function getReports(): CivixaReport[] {
  return getItem<CivixaReport[]>(KEYS.REPORTS) ?? [];
}

export function setReports(reports: CivixaReport[]): void {
  setItem(KEYS.REPORTS, reports);
}

// ─── Users ───────────────────────────────────────────────────────────────────
export function getUsers(): CivixaUser[] {
  return getItem<CivixaUser[]>(KEYS.USERS) ?? [];
}

export function setUsers(users: CivixaUser[]): void {
  setItem(KEYS.USERS, users);
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────
export function getAuditLogs(): CivixaAuditLog[] {
  return getItem<CivixaAuditLog[]>(KEYS.AUDIT_LOGS) ?? [];
}

export function setAuditLogs(logs: CivixaAuditLog[]): void {
  setItem(KEYS.AUDIT_LOGS, logs);
}

export function addAuditLog(log: Omit<CivixaAuditLog, 'id' | 'createdAt'>): void {
  const logs = getAuditLogs();
  logs.unshift({
    ...log,
    id: generateId(),
    createdAt: new Date().toISOString(),
  });
  setAuditLogs(logs.slice(0, 200));
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
export function seedIfEmpty(): void {
  // Only seed if no locations exist
  if (getLocations().length > 0) return;

  const locations: CivixaLocation[] = [
    { id: 'loc-1', name: 'Chennai', slug: 'civixa_chennai', createdAt: '2024-01-01' },
    { id: 'loc-2', name: 'Coimbatore', slug: 'civixa_coimbatore', createdAt: '2024-01-02' },
    { id: 'loc-3', name: 'Madurai', slug: 'civixa_madurai', createdAt: '2024-01-03' },
  ];
  setLocations(locations);

  const services: CivixaService[] = [
    // Chennai
    { id: 'svc-1', locationId: 'loc-1', serviceName: 'Water Supply', status: 'Operational', impact: 'Residential & Commercial', lastUpdated: new Date().toISOString() },
    { id: 'svc-2', locationId: 'loc-1', serviceName: 'Electricity', status: 'Warning', impact: 'Partial outages in Zone 4', lastUpdated: new Date().toISOString() },
    { id: 'svc-3', locationId: 'loc-1', serviceName: 'Road Maintenance', status: 'Interrupted', impact: 'Anna Salai repairs blocking traffic', lastUpdated: new Date().toISOString() },
    { id: 'svc-4', locationId: 'loc-1', serviceName: 'Internet', status: 'Operational', impact: 'All ISPs functional', lastUpdated: new Date().toISOString() },
    // Coimbatore
    { id: 'svc-5', locationId: 'loc-2', serviceName: 'Water Supply', status: 'Operational', impact: 'Normal distribution', lastUpdated: new Date().toISOString() },
    { id: 'svc-6', locationId: 'loc-2', serviceName: 'Electricity', status: 'Operational', impact: 'All feeders stable', lastUpdated: new Date().toISOString() },
    { id: 'svc-7', locationId: 'loc-2', serviceName: 'Waste Management', status: 'Warning', impact: 'Collection delays in east zone', lastUpdated: new Date().toISOString() },
    // Madurai
    { id: 'svc-8', locationId: 'loc-3', serviceName: 'Water Supply', status: 'Interrupted', impact: 'Main pipeline repair underway', lastUpdated: new Date().toISOString() },
    { id: 'svc-9', locationId: 'loc-3', serviceName: 'Road Maintenance', status: 'Operational', impact: 'All major roads accessible', lastUpdated: new Date().toISOString() },
  ];
  setServices(services);

  const now = new Date();
  const reports: CivixaReport[] = [
    {
      id: 'rep-1',
      locationId: 'loc-1',
      serviceId: 'svc-2',
      area: 'Adyar',
      description: 'Power has been flickering for the past 2 hours. Several appliances damaged.',
      contactEmail: 'mod@civixa.local',
      status: 'pending',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'rep-2',
      locationId: 'loc-1',
      serviceId: 'svc-3',
      area: 'T. Nagar',
      description: 'Large pothole on main road causing accidents. No signage or barriers.',
      contactEmail: 'mod@civixa.local',
      status: 'pending',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'rep-3',
      locationId: 'loc-1',
      serviceId: 'svc-2',
      area: 'Velachery',
      description: 'Complete power outage since morning. No response from local TNEB office.',
      contactEmail: 'resident@example.com',
      status: 'approved',
      createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    },
  ];
  setReports(reports);

  const users: CivixaUser[] = [
    { userId: 'admin-1', name: 'System Admin', email: 'admin@civixa.local', isAdmin: true, isModerator: false, mustChangePassword: true, token: 'admin-token' },
    { userId: 'mod-1', name: 'Chennai Mod', email: 'mod@civixa.local', isAdmin: false, isModerator: true, assignedLocationId: 'loc-1', mustChangePassword: false, token: 'mod-token' },
  ];
  setUsers(users);

  const auditLogs: CivixaAuditLog[] = [
    { id: 'log-1', action: 'Report approved: Electricity outage in Velachery', performedBy: 'mod-1', performedByName: 'Chennai Mod', locationId: 'loc-1', createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString() },
    { id: 'log-2', action: 'Service status updated: Electricity → Warning', performedBy: 'mod-1', performedByName: 'Chennai Mod', locationId: 'loc-1', createdAt: new Date(now.getTime() - 9 * 60 * 1000).toISOString() },
  ];
  setAuditLogs(auditLogs);
}
