import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield, Database, MapPin, Users, Wrench, ScrollText,
  Plus, Trash2, ChevronRight, LayoutDashboard, Pencil, UserPlus, FileEdit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { BackgroundLayout } from '../components/BackgroundLayout';
import { useData } from '../context/DataContext';
import { useSession } from '../context/SessionContext';
import { getUsers, setUsers, addAuditLog, generateId } from '../lib/storage';
import { toast } from 'sonner';
import type { CivixaUser } from '../types/civixa';

export function Admin() {
  const navigate = useNavigate();
  const { locations, services, reports, auditLogs, addLocation, editLocation, deleteLocation, addService, deleteService, updateServiceStatus } = useData();
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

  // Status change with description dialog
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    svcId: string;
    svcName: string;
    newStatus: 'Operational' | 'Warning' | 'Interrupted';
    description: string;
  } | null>(null);

  const handleStatusSelect = (svc: { id: string; serviceName: string; description?: string }, newStatus: 'Operational' | 'Warning' | 'Interrupted') => {
    setStatusChangeDialog({
      svcId: svc.id,
      svcName: svc.serviceName,
      newStatus,
      description: svc.description ?? '',
    });
  };

  const confirmStatusChange = () => {
    if (!statusChangeDialog) return;
    updateServiceStatus(statusChangeDialog.svcId, statusChangeDialog.newStatus, statusChangeDialog.description);
    toast.success(`${statusChangeDialog.svcName} → ${statusChangeDialog.newStatus}`);
    setStatusChangeDialog(null);
  };

  // Remove User
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    const user = getUsers().find((u) => u.userId === deleteUserId);
    setUsers(getUsers().filter((u) => u.userId !== deleteUserId));
    addAuditLog({
      action: `User removed: ${user?.name ?? deleteUserId} (${user?.email ?? ''})`,
      performedBy: session?.userId ?? 'admin',
      performedByName: session?.name ?? 'Admin',
      locationId: '',
    });
    refreshUsers();
    toast.success(`User "${user?.name}" removed`);
    setDeleteUserId(null);
  };

  // Add User
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'moderator'>('moderator');
  const [newUserLocId, setNewUserLocId] = useState('');

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

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;
    if (newUserRole === 'moderator' && !newUserLocId) return;

    const newUser: CivixaUser = {
      userId: generateId(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      isAdmin: newUserRole === 'admin',
      isModerator: newUserRole === 'moderator',
      ...(newUserRole === 'moderator' ? { assignedLocationId: newUserLocId } : {}),
      mustChangePassword: false,
      token: generateId(),
    };

    setUsers([...getUsers(), newUser]);

    addAuditLog({
      action: `User added: ${newUser.name} (${newUser.email}) as ${newUserRole}`,
      performedBy: session?.userId ?? 'admin',
      performedByName: session?.name ?? 'Admin',
      locationId: newUserRole === 'moderator' ? newUserLocId : '',
    });

    refreshUsers();
    toast.success(`User "${newUser.name}" added as ${newUserRole}`);
    setAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('moderator');
    setNewUserLocId('');
  };

  // Stats
  const stats = [
    { label: 'Locations', value: locations.length, icon: MapPin, color: 'text-cyan-400' },
    { label: 'Services', value: services.length, icon: Wrench, color: 'text-blue-400' },
    { label: 'Users', value: users.length, icon: Users, color: 'text-purple-400' },
    { label: 'Reports', value: reports.length, icon: ScrollText, color: 'text-amber-400' },
  ];

  return (
    <BackgroundLayout>
    <div className="min-h-screen">
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
                <h2 className="text-sm font-semibold">All Services ({filteredServices.length})</h2>
                <Select value={filterLocId} onValueChange={setFilterLocId}>
                  <SelectTrigger className="h-8 w-44 text-xs border-white/15 bg-white/5">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
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
                    <TableHead className="text-xs">Service Name</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Impact</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((svc) => {
                    const locName = locations.find((l) => l.id === svc.locationId)?.name ?? '—';
                    return (
                      <TableRow key={svc.id} className="border-white/5">
                        <TableCell className="font-medium text-sm">{svc.serviceName}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 inline-block shrink-0" style={{ color: 'oklch(0.72 0.16 195)' }} />
                            {locName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={svc.status}
                            onValueChange={(val) =>
                              handleStatusSelect(svc, val as 'Operational' | 'Warning' | 'Interrupted')
                            }
                          >
                            <SelectTrigger
                              className={`h-7 w-36 text-xs border font-medium ${
                                svc.status === 'Operational'
                                  ? 'status-operational'
                                  : svc.status === 'Warning'
                                  ? 'status-warning'
                                  : 'status-interrupted'
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operational">Operational</SelectItem>
                              <SelectItem value="Warning">Warning</SelectItem>
                              <SelectItem value="Interrupted">Interrupted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{svc.impact}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {svc.description ?? <span className="opacity-40">—</span>}
                        </TableCell>
                        <TableCell className="text-right pr-3">
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
                  {filteredServices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                        {filterLocId !== 'all' ? 'No services in this location.' : 'No services yet. Add one using the button above.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold">All Users ({users.length})</h2>
              <Button size="sm" onClick={() => setAddUserOpen(true)} className="gap-1.5"
                style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
                <UserPlus className="w-4 h-4" />Add User
              </Button>
            </div>
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
                          {!user.isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteUserId(user.userId)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={(v) => { setAddUserOpen(v); if (!v) { setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('moderator'); setNewUserLocId(''); } }}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="Full name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Password</Label>
              <Input
                type="text"
                placeholder="Set a password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={newUserRole} onValueChange={(v) => { setNewUserRole(v as 'admin' | 'moderator'); setNewUserLocId(''); }}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUserRole === 'moderator' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Assigned Location</Label>
                <Select value={newUserLocId} onValueChange={setNewUserLocId}>
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
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setAddUserOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleAddUser}
              disabled={!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || (newUserRole === 'moderator' && !newUserLocId)}
              style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}
            >
              Add User
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

      {/* Delete User Confirm */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(v) => !v && setDeleteUserId(null)}>
        <AlertDialogContent className="glass-card-solid border-white/15">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this user. They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
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

      {/* Status Change with Description Dialog */}
      <Dialog open={!!statusChangeDialog} onOpenChange={(v) => !v && setStatusChangeDialog(null)}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" style={{ color: 'oklch(0.72 0.16 195)' }} />
              <DialogTitle className="text-base">Change Service Status</DialogTitle>
            </div>
          </DialogHeader>
          {statusChangeDialog && (
            <div className="space-y-4 mt-2">
              <div className="rounded-lg px-3 py-2.5 text-sm" style={{ background: 'oklch(0.18 0.03 245)', border: '1px solid oklch(0.3 0.05 245)' }}>
                <p className="text-xs text-muted-foreground mb-0.5">Service</p>
                <p className="font-medium">{statusChangeDialog.svcName}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ background: 'oklch(0.18 0.03 245)', border: '1px solid oklch(0.3 0.05 245)' }}>
                  <p className="text-xs text-muted-foreground mb-0.5">New Status</p>
                  <span className={`text-xs font-semibold ${
                    statusChangeDialog.newStatus === 'Operational' ? 'text-emerald-400'
                    : statusChangeDialog.newStatus === 'Warning' ? 'text-amber-400'
                    : 'text-red-400'
                  }`}>
                    {statusChangeDialog.newStatus}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  placeholder="Describe the current situation, affected areas, estimated resolution…"
                  value={statusChangeDialog.description}
                  onChange={(e) => setStatusChangeDialog({ ...statusChangeDialog, description: e.target.value })}
                  className="text-sm resize-none"
                  rows={3}
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setStatusChangeDialog(null)}>Cancel</Button>
            <Button
              size="sm"
              onClick={confirmStatusChange}
              style={{
                background: statusChangeDialog?.newStatus === 'Operational'
                  ? 'oklch(0.55 0.15 155)'
                  : statusChangeDialog?.newStatus === 'Warning'
                  ? 'oklch(0.6 0.18 75)'
                  : 'oklch(0.55 0.2 25)',
                color: 'white'
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </BackgroundLayout>
  );
}
