import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    id: string;
    name: string;
    slug: string;
}
export interface AuditLog {
    action: string;
    userId: Principal;
    locationId: string;
    timestamp: Time;
}
export type Time = bigint;
export interface User {
    id: Principal;
    name: string;
    role: Role;
    email: string;
    mustChangePassword: boolean;
}
export interface Service {
    id: string;
    status: ServiceStatus;
    impact: string;
    name: string;
    locationId: string;
}
export interface Report {
    id: string;
    status: Variant_pending_approved_rejected;
    area: string;
    description: string;
    locationId: string;
    timestamp: Time;
    contactEmail: string;
    serviceId: string;
}
export type Role = {
    __kind__: "admin";
    admin: null;
} | {
    __kind__: "moderator";
    moderator: string;
} | {
    __kind__: "user";
    user: null;
};
export enum ServiceStatus {
    warning = "warning",
    interrupted = "interrupted",
    operational = "operational"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addService(locationId: string, name: string, impact: string): Promise<void>;
    approveReport(reportId: string): Promise<void>;
    createLocation(name: string): Promise<void>;
    getAllLocations(): Promise<Array<Location>>;
    getAllUsers(): Promise<Array<User>>;
    getAuditLogs(locationId: string): Promise<Array<AuditLog>>;
    getPendingReports(locationId: string): Promise<Array<Report>>;
    getServicesByLocation(locationId: string): Promise<Array<Service>>;
    register(name: string, email: string): Promise<void>;
    rejectReport(reportId: string): Promise<void>;
    submitReport(locationId: string, serviceId: string, area: string, description: string, contactEmail: string): Promise<void>;
}
