import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CivixaLocation, CivixaService, CivixaReport, CivixaAuditLog } from '../types/civixa';
import {
  getLocations, setLocations,
  getServices, setServices,
  getReports, setReports,
  getAuditLogs, addAuditLog,
  generateId,
} from '../lib/storage';
import { computeServiceStatus } from '../lib/statusAutomation';
import { useSession } from './SessionContext';

interface DataContextValue {
  locations: CivixaLocation[];
  services: CivixaService[];
  reports: CivixaReport[];
  auditLogs: CivixaAuditLog[];
  refresh: () => void;

  addLocation: (name: string) => void;
  editLocation: (id: string, name: string) => void;
  deleteLocation: (id: string) => void;
  addService: (locationId: string, name: string, impact: string) => void;
  deleteService: (id: string) => void;
  updateServiceStatus: (serviceId: string, status: CivixaService['status']) => void;
  submitReport: (data: Omit<CivixaReport, 'id' | 'status' | 'createdAt'>) => void;
  approveReport: (reportId: string) => void;
  rejectReport: (reportId: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();

  const [locations, setLocationsState] = useState<CivixaLocation[]>(() => getLocations());
  const [services, setServicesState] = useState<CivixaService[]>(() => getServices());
  const [reports, setReportsState] = useState<CivixaReport[]>(() => getReports());
  const [auditLogs, setAuditLogsState] = useState<CivixaAuditLog[]>(() => getAuditLogs());

  const refresh = useCallback(() => {
    setLocationsState(getLocations());
    setServicesState(getServices());
    setReportsState(getReports());
    setAuditLogsState(getAuditLogs());
  }, []);

  // Auto-reset non-Operational services to Operational after 1 hour
  useEffect(() => {
    const ONE_HOUR_MS = 60 * 60 * 1000;

    const check = () => {
      const svcs = getServices();
      const now = Date.now();
      let changed = false;

      const updated = svcs.map((svc) => {
        if (svc.status === 'Operational') return svc;
        const age = now - new Date(svc.lastUpdated).getTime();
        if (age >= ONE_HOUR_MS) {
          changed = true;
          addAuditLog({
            action: `Service auto-reset: ${svc.serviceName} → Operational (1-hour timeout)`,
            performedBy: 'system',
            performedByName: 'System',
            locationId: svc.locationId,
          });
          return { ...svc, status: 'Operational' as const, lastUpdated: new Date().toISOString() };
        }
        return svc;
      });

      if (changed) {
        setServices(updated);
        setServicesState([...updated]);
        setAuditLogsState(getAuditLogs());
      }
    };

    // Run immediately on mount, then every 60 seconds
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const addLocation = useCallback((name: string) => {
    const locs = getLocations();
    const slug = `civixa_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const newLoc: CivixaLocation = {
      id: generateId(),
      name,
      slug,
      createdAt: new Date().toISOString(),
    };
    const updated = [...locs, newLoc];
    setLocations(updated);
    setLocationsState(updated);

    addAuditLog({
      action: `Location created: ${name}`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId: newLoc.id,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  const editLocation = useCallback((id: string, name: string) => {
    const locs = getLocations();
    const idx = locs.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const slug = `civixa_${name.toLowerCase().replace(/\s+/g, '_')}`;
    locs[idx] = { ...locs[idx], name, slug };
    setLocations(locs);
    setLocationsState([...locs]);

    addAuditLog({
      action: `Location renamed to: ${name}`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId: id,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  const deleteLocation = useCallback((id: string) => {
    const locs = getLocations().filter((l) => l.id !== id);
    setLocations(locs);
    setLocationsState(locs);

    // Delete associated services and reports
    const svcs = getServices().filter((s) => s.locationId !== id);
    setServices(svcs);
    setServicesState(svcs);

    const reps = getReports().filter((r) => r.locationId !== id);
    setReports(reps);
    setReportsState(reps);

    addAuditLog({
      action: `Location deleted: ${id}`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId: id,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  const addService = useCallback((locationId: string, name: string, impact: string) => {
    const svcs = getServices();
    const newSvc: CivixaService = {
      id: generateId(),
      locationId,
      serviceName: name,
      status: 'Operational',
      impact,
      lastUpdated: new Date().toISOString(),
    };
    const updated = [...svcs, newSvc];
    setServices(updated);
    setServicesState(updated);

    addAuditLog({
      action: `Service added: ${name} (${locationId})`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  const deleteService = useCallback((id: string) => {
    const svcs = getServices().filter((s) => s.id !== id);
    setServices(svcs);
    setServicesState(svcs);
  }, []);

  const updateServiceStatus = useCallback((serviceId: string, status: CivixaService['status']) => {
    const svcs = getServices();
    const idx = svcs.findIndex((s) => s.id === serviceId);
    if (idx < 0) return;
    const svcName = svcs[idx].serviceName;
    const locationId = svcs[idx].locationId;
    svcs[idx] = { ...svcs[idx], status, lastUpdated: new Date().toISOString() };
    setServices(svcs);
    setServicesState([...svcs]);

    addAuditLog({
      action: `Service status changed: ${svcName} → ${status}`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  const submitReport = useCallback((data: Omit<CivixaReport, 'id' | 'status' | 'createdAt'>) => {
    const reps = getReports();
    const newReport: CivixaReport = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newReport, ...reps];
    setReports(updated);
    setReportsState(updated);
  }, []);

  const approveReport = useCallback((reportId: string) => {
    const reps = getReports();
    const idx = reps.findIndex((r) => r.id === reportId);
    if (idx < 0) return;

    reps[idx] = { ...reps[idx], status: 'approved' };
    setReports(reps);
    setReportsState([...reps]);

    // Recompute service status
    const report = reps[idx];
    const newStatus = computeServiceStatus(report.serviceId, reps);

    const svcs = getServices();
    const svcIdx = svcs.findIndex((s) => s.id === report.serviceId);
    if (svcIdx >= 0) {
      svcs[svcIdx] = {
        ...svcs[svcIdx],
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      };
      setServices(svcs);
      setServicesState([...svcs]);
    }

    addAuditLog({
      action: `Report approved: ${report.description.slice(0, 50)}… → Service status: ${newStatus}`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId: report.locationId,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  const rejectReport = useCallback((reportId: string) => {
    const reps = getReports();
    const idx = reps.findIndex((r) => r.id === reportId);
    if (idx < 0) return;

    const report = reps[idx];
    reps[idx] = { ...reps[idx], status: 'rejected' };
    setReports(reps);
    setReportsState([...reps]);

    addAuditLog({
      action: `Report rejected: ${report.description.slice(0, 50)}…`,
      performedBy: session?.userId ?? 'system',
      performedByName: session?.name ?? 'System',
      locationId: report.locationId,
    });
    setAuditLogsState(getAuditLogs());
  }, [session]);

  return (
    <DataContext.Provider value={{
      locations, services, reports, auditLogs, refresh,
      addLocation, editLocation, deleteLocation,
      addService, deleteService, updateServiceStatus,
      submitReport, approveReport, rejectReport,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
