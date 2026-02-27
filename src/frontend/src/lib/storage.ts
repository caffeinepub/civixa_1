// ─── localStorage Keys ────────────────────────────────────────────────────────
export const KEYS = {
  SESSION: 'civixaSession',
  LOCATIONS: 'civixaLocations',
  SERVICES: 'civixaServices',
  REPORTS: 'civixaReports',
  USERS: 'civixaUsers',
  AUDIT_LOGS: 'civixaAuditLogs',
  LAST_REPORT_TIME: 'civixaLastReportTime',
  SEED_VERSION: 'civixaSeedVersion',
} as const;

// Increment this whenever the seed data changes to force a re-seed for existing users
const CURRENT_SEED_VERSION = 2;

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
  // Re-seed if no locations exist OR if seed version is outdated
  const storedVersion = parseInt(localStorage.getItem(KEYS.SEED_VERSION) ?? '0', 10);
  if (getLocations().length > 0 && storedVersion >= CURRENT_SEED_VERSION) return;

  // Clear existing data to apply the new seed cleanly
  localStorage.removeItem(KEYS.LOCATIONS);
  localStorage.removeItem(KEYS.SERVICES);
  localStorage.removeItem(KEYS.REPORTS);

  const locations: CivixaLocation[] = [
    { id: 'loc-1', name: 'Chennai', slug: 'civixa_chennai', createdAt: '2024-01-01' },
    { id: 'loc-2', name: 'Coimbatore', slug: 'civixa_coimbatore', createdAt: '2024-01-02' },
    { id: 'loc-3', name: 'Madurai', slug: 'civixa_madurai', createdAt: '2024-01-03' },
  ];
  setLocations(locations);

  const now = new Date().toISOString();

  // Core services shared across all locations
  const coreServiceTemplates: Array<{ name: string; impact: string }> = [
    { name: 'Electricity Supply', impact: 'Residential & Commercial power distribution' },
    { name: 'Government Offices', impact: 'Municipal, district and state offices' },
    { name: 'Water Supply', impact: 'Drinking water & sewage systems' },
    { name: 'Traffic Signals', impact: 'All major junctions and crossroads' },
    { name: 'Roads', impact: 'City roads, highways and flyovers' },
    // Banks
    { name: 'State Bank of India (SBI)', impact: 'Branch & ATM operations' },
    { name: 'HDFC Bank', impact: 'Branch & ATM operations' },
    { name: 'ICICI Bank', impact: 'Branch & ATM operations' },
    { name: 'Axis Bank', impact: 'Branch & ATM operations' },
    { name: 'Punjab National Bank (PNB)', impact: 'Branch & ATM operations' },
    { name: 'Kotak Mahindra Bank', impact: 'Branch & ATM operations' },
    { name: 'Bank of Baroda', impact: 'Branch & ATM operations' },
    { name: 'Canara Bank', impact: 'Branch & ATM operations' },
    { name: 'Union Bank of India', impact: 'Branch & ATM operations' },
    { name: 'IndusInd Bank', impact: 'Branch & ATM operations' },
    // ISPs
    { name: 'Internet – BSNL', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – Jio Fiber', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – Airtel', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – ACT Fibernet', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – Hathway', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – SITI Networks', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – Excitel', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – YOU Broadband', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – TATA Play Fiber', impact: 'Broadband & fiber connectivity' },
    { name: 'Internet – Spectra', impact: 'Broadband & fiber connectivity' },
  ];

  const services: CivixaService[] = [];
  let svcCounter = 1;

  for (const loc of locations) {
    for (const tmpl of coreServiceTemplates) {
      services.push({
        id: `svc-${svcCounter++}`,
        locationId: loc.id,
        serviceName: tmpl.name,
        status: 'Operational',
        impact: tmpl.impact,
        lastUpdated: now,
      });
    }
  }

  setServices(services);

  const seedNow = new Date();
  const reports: CivixaReport[] = [
    {
      id: 'rep-1',
      locationId: 'loc-1',
      serviceId: 'svc-2',
      area: 'Adyar',
      description: 'Power has been flickering for the past 2 hours. Several appliances damaged.',
      contactEmail: 'mod@civixa.local',
      status: 'pending',
      createdAt: new Date(seedNow.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'rep-2',
      locationId: 'loc-1',
      serviceId: 'svc-5',
      area: 'T. Nagar',
      description: 'Large pothole on main road causing accidents. No signage or barriers.',
      contactEmail: 'mod@civixa.local',
      status: 'pending',
      createdAt: new Date(seedNow.getTime() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'rep-3',
      locationId: 'loc-1',
      serviceId: 'svc-1',
      area: 'Velachery',
      description: 'Complete power outage since morning. No response from local TNEB office.',
      contactEmail: 'resident@example.com',
      status: 'approved',
      createdAt: new Date(seedNow.getTime() - 25 * 60 * 1000).toISOString(),
    },
  ];
  setReports(reports);

  const users: CivixaUser[] = [
    { userId: 'admin-1', name: 'System Admin', email: 'admin@civixa.local', isAdmin: true, isModerator: false, mustChangePassword: true, token: 'admin-token' },
    { userId: 'mod-1', name: 'Chennai Mod', email: 'mod@civixa.local', isAdmin: false, isModerator: true, assignedLocationId: 'loc-1', mustChangePassword: false, token: 'mod-token' },
  ];
  setUsers(users);

  const auditLogs: CivixaAuditLog[] = [
    { id: 'log-1', action: 'Report approved: Electricity outage in Velachery', performedBy: 'mod-1', performedByName: 'Chennai Mod', locationId: 'loc-1', createdAt: new Date(seedNow.getTime() - 10 * 60 * 1000).toISOString() },
    { id: 'log-2', action: 'Service status updated: Electricity Supply → Warning', performedBy: 'mod-1', performedByName: 'Chennai Mod', locationId: 'loc-1', createdAt: new Date(seedNow.getTime() - 9 * 60 * 1000).toISOString() },
  ];
  setAuditLogs(auditLogs);
  localStorage.setItem(KEYS.SEED_VERSION, String(CURRENT_SEED_VERSION));
}
