import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield, Database, MapPin, Users, Wrench, ScrollText,
  Plus, Trash2, ChevronRight, UserCheck, LayoutDashboard, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NavBar } from '../components/NavBar';
import { useData } from '../context/DataContext';
import { useSession } from '../context/SessionContext';
import { getUsers, setUsers } from '../lib/storage';
import { toast } from 'sonner';
import type { CivixaUser } from '../types/civixa';

export function Admin() {
  const navigate = useNavigate();
  const { locations, services, reports, auditLogs, addLocation, editLocation, deleteLocation, addService, deleteService } = useData();
  const { session } = useSession();

  // Dialogs
  const [addLocOpen, setAddLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [deleteLocId, setDeleteLocId] = useState<string | null>(null);
  const [editLocId, setEditLocId] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');

  const [addSvcOpen, setAddSvcOpen] = useState(false);
  const [svcLocId, setSvcLocId] = useState('');
  const [svcName, setSvcName] = useState('');
  const [svcImpact, setSvcImpact] = useState('');
  const [filterLocId, setFilterLocId] = useState('all');

  const [deleteSvcId, setDeleteSvcId] = useState<string | null>(null);

  const [promoteUserId, setPromoteUserId] = useState<string | null>(null);
  const [promoteLocId, setPromoteLocId] = useState('');

  const [users, setUsersState] = useState<CivixaUser[]>(() => getUsers());
  const refreshUsers = () => setUsersState(getUsers());

  const handleAddLocation = () => {
    if (!newLocName.trim()) return;
    addLocation(newLocName.trim());
    toast.success(`Location "${newLocName}" created`);
    setNewLocName('');
    setAddLocOpen(false);
  };

  const handleDeleteLocation = () => {
    if (!deleteLocId) return;
    const loc = locations.find((l) => l.id === deleteLocId);
    deleteLocation(deleteLocId);
    toast.success(`Location "${loc?.name}" deleted`);
    setDeleteLocId(null);
  };

  const openEditLoc = (id: string, currentName: string) => {
    setEditLocId(id);
    setEditLocName(currentName);
  };

  const handleEditLocation = () => {
    if (!editLocId || !editLocName.trim()) return;
    editLocation(editLocId, editLocName.trim());
    toast.success(`Location renamed to "${editLocName.trim()}"`);
    setEditLocId(null);
    setEditLocName('');
  };

  const filteredServices = filterLocId && filterLocId !== 'all'
    ? services.filter((s) => s.locationId === filterLocId)
    : services;

  const handleAddService = () => {
    if (!svcLocId || !svcName.trim()) return;
    addService(svcLocId, svcName.trim(), svcImpact.trim() || 'General services');
    toast.success(`Service "${svcName}" added`);
    setSvcName('');
    setSvcImpact('');
    setAddSvcOpen(false);
  };

  const handleDeleteService = () => {
    if (!deleteSvcId) return;
    deleteService(deleteSvcId);
    toast.success('Service deleted');
    setDeleteSvcId(null);
  };

  const handlePromote = () => {
    if (!promoteUserId || !promoteLocId) return;
    const allUsers = getUsers();
    const idx = allUsers.findIndex((u) => u.userId === promoteUserId);
    if (idx < 0) return;
    allUsers[idx] = {
      ...allUsers[idx],
      isModerator: true,
      assignedLocationId: promoteLocId,
    };
    setUsers(allUsers);
    refreshUsers();
    toast.success('User promoted to moderator');
    setPromoteUserId(null);
    setPromoteLocId('');
  };

  // Stats
  const stats = [
    { label: 'Locations', value: locations.length, icon: MapPin, color: 'text-cyan-400' },
    { label: 'Services', value: services.length, icon: Wrench, color: 'text-blue-400' },
    { label: 'Users', value: users.length, icon: Users, color: 'text-purple-400' },
    { label: 'Reports', value: reports.length, icon: ScrollText, color: 'text-amber-400' },
  ];

  const promoteUser = users.find((u) => u.userId === promoteUserId);

  return (
    <div className="min-h-screen" style={{ background: 'oklch(var(--background))' }}>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(0.72 0.18 60 / 0.1)', border: '1px solid oklch(0.72 0.18 60 / 0.3)' }}>
              <Shield className="w-5 h-5" style={{ color: 'oklch(0.72 0.18 60)' }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">System Administration — {session?.name}</p>
            </div>
          </div>
          <Button
            onClick={() => void navigate({ to: '/admin/database' })}
            variant="outline"
            size="sm"
            className="gap-2 border-white/15 hover:bg-white/5"
          >
            <Database className="w-4 h-4" />
            Edit Database
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-8 gap-1" style={{ background: 'oklch(0.18 0.03 245)' }}>
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5" />Locations
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1.5 text-xs">
              <Wrench className="w-3.5 h-3.5" />Services
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 text-xs">
              <ScrollText className="w-3.5 h-3.5" />Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: 'oklch(0.72 0.16 195)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-xs leading-relaxed">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {log.performedByName} · {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Locations */}
          <TabsContent value="locations">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold">All Locations ({locations.length})</h2>
              <Button size="sm" onClick={() => setAddLocOpen(true)} className="gap-1.5"
                style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
                <Plus className="w-4 h-4" />Add Location
              </Button>
            </div>

            <div className="glass-card-solid overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Database Slug</TableHead>
                    <TableHead className="text-xs">Services</TableHead>
                    <TableHead className="text-xs">Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id} className="border-white/5">
                      <TableCell className="font-medium text-sm">{loc.name}</TableCell>
                      <TableCell>
                        <code className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                          {loc.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {services.filter((s) => s.locationId === loc.id).length}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(loc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                            onClick={() => openEditLoc(loc.id, loc.name)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteLocId(loc.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold">Services</h2>
                <Select value={filterLocId} onValueChange={setFilterLocId}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => setAddSvcOpen(true)} className="gap-1.5"
                style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
                <Plus className="w-4 h-4" />Add Service
              </Button>
            </div>

            <div className="glass-card-solid overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-xs">Service</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Impact</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((svc) => {
                    const loc = locations.find((l) => l.id === svc.locationId);
                    return (
                      <TableRow key={svc.id} className="border-white/5">
                        <TableCell className="font-medium text-sm">{svc.serviceName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{loc?.name ?? svc.locationId}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              svc.status === 'Operational' ? 'status-operational' :
                              svc.status === 'Warning' ? 'status-warning' : 'status-interrupted'
                            }`}
                          >
                            {svc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-40 truncate">{svc.impact}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteSvcId(svc.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <h2 className="text-sm font-semibold mb-4">All Users ({users.length})</h2>
            <div className="glass-card-solid overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Assigned Location</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const assignedLoc = user.assignedLocationId
                      ? locations.find((l) => l.id === user.assignedLocationId)
                      : null;
                    return (
                      <TableRow key={user.userId} className="border-white/5">
                        <TableCell className="font-medium text-sm">{user.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{user.email}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge className="text-xs" style={{ background: 'oklch(0.72 0.18 60 / 0.15)', color: 'oklch(0.72 0.18 60)', border: '1px solid oklch(0.72 0.18 60 / 0.3)' }}>Admin</Badge>
                          ) : user.isModerator ? (
                            <Badge className="text-xs" style={{ background: 'oklch(0.72 0.16 195 / 0.15)', color: 'oklch(0.72 0.16 195)', border: '1px solid oklch(0.72 0.16 195 / 0.3)' }}>Moderator</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {assignedLoc?.name ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {!user.isAdmin && !user.isModerator && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs border-white/15 hover:bg-white/5"
                              onClick={() => setPromoteUserId(user.userId)}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Promote
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Audit Logs */}
          <TabsContent value="audit">
            <h2 className="text-sm font-semibold mb-4">System Audit Logs</h2>
            <div className="glass-card-solid overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Performed By</TableHead>
                    <TableHead className="text-xs">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id} className="border-white/5">
                      <TableCell className="text-sm max-w-sm">{log.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.performedByName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {auditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground text-sm py-8">
                        No audit logs yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={addLocOpen} onOpenChange={setAddLocOpen}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Add Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">City Name</Label>
              <Input
                placeholder="e.g. Trichy"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setAddLocOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddLocation} disabled={!newLocName.trim()}
              style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
              Create Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={!!editLocId} onOpenChange={(v) => !v && setEditLocId(null)}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Rename Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">City Name</Label>
              <Input
                placeholder="New name…"
                value={editLocName}
                onChange={(e) => setEditLocName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditLocation()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setEditLocId(null)}>Cancel</Button>
            <Button size="sm" onClick={handleEditLocation} disabled={!editLocName.trim()}
              style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={addSvcOpen} onOpenChange={setAddSvcOpen}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Add Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Select value={svcLocId} onValueChange={setSvcLocId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select location…" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Service Name</Label>
              <Input placeholder="e.g. Sanitation" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Impact Description</Label>
              <Input placeholder="e.g. Affects residential zones" value={svcImpact} onChange={(e) => setSvcImpact(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setAddSvcOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddService} disabled={!svcLocId || !svcName.trim()}
              style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote User Dialog */}
      <Dialog open={!!promoteUserId} onOpenChange={(v) => !v && setPromoteUserId(null)}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Promote to Moderator</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">
              Promote <strong className="text-foreground">{promoteUser?.name}</strong> to moderator and assign a location.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Assign Location</Label>
              <Select value={promoteLocId} onValueChange={setPromoteLocId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select location…" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setPromoteUserId(null)}>Cancel</Button>
            <Button size="sm" onClick={handlePromote} disabled={!promoteLocId}
              style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
              Promote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Location Confirm */}
      <AlertDialog open={!!deleteLocId} onOpenChange={(v) => !v && setDeleteLocId(null)}>
        <AlertDialogContent className="glass-card-solid border-white/15">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the location and all associated services and reports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLocation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Service Confirm */}
      <AlertDialog open={!!deleteSvcId} onOpenChange={(v) => !v && setDeleteSvcId(null)}>
        <AlertDialogContent className="glass-card-solid border-white/15">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
