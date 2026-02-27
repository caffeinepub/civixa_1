import { useState } from 'react';
import { Database, Download, Trash2, Cpu, Plus, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavBar } from '../components/NavBar';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';

export function AdminDatabase() {
  const { locations, services, reports, addLocation, deleteLocation } = useData();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [lastBackup, setLastBackup] = useState<Record<string, string>>({});

  const handleBackup = (locId: string, locName: string) => {
    setLastBackup((prev) => ({ ...prev, [locId]: new Date().toLocaleString() }));
    toast.success(`Backup of ${locName} completed successfully`);
  };

  const handleMigrate = (locName: string) => {
    toast.success(`Migration applied to ${locName}`);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const loc = locations.find((l) => l.id === deleteId);
    deleteLocation(deleteId);
    toast.success(`Database for "${loc?.name}" deleted`);
    setDeleteId(null);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    addLocation(newName.trim());
    toast.success(`Database for "${newName}" created and migrated`);
    setNewName('');
    setAddOpen(false);
  };

  const systemInfo = {
    totalDatabases: locations.length + 1, // +1 for master
    totalServices: services.length,
    totalReports: reports.length,
    dbVersion: '14.2',
  };

  return (
    <div className="min-h-screen" style={{ background: 'oklch(var(--background))' }}>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(0.5 0.18 255 / 0.1)', border: '1px solid oklch(0.5 0.18 255 / 0.3)' }}>
              <Database className="w-5 h-5" style={{ color: 'oklch(0.72 0.16 195)' }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Database Management</h1>
              <p className="text-xs text-muted-foreground">Manage location databases and system backups</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="gap-2"
            style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            Create New Location Database
          </Button>
        </div>

        {/* System Info */}
        <div className="glass-card p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">System Information</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SysInfo label="Total Databases" value={systemInfo.totalDatabases.toString()} />
            <SysInfo label="PostgreSQL Version" value={systemInfo.dbVersion} />
            <SysInfo label="Total Services" value={systemInfo.totalServices.toString()} />
            <SysInfo label="Total Reports" value={systemInfo.totalReports.toString()} />
          </div>
        </div>

        {/* Master DB */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Master Database</h2>
          <div className="glass-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 p-1.5 rounded-lg"
                  style={{ background: 'oklch(0.72 0.18 60 / 0.1)', color: 'oklch(0.72 0.18 60)' }} />
                <div>
                  <p className="font-semibold text-sm">civixa_master</p>
                  <p className="text-xs text-muted-foreground">Global system — users, locations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-white/15 hover:bg-white/5"
                  onClick={() => toast.success('Master DB backup complete')}>
                  <Download className="w-3.5 h-3.5" />Backup
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-white/15 hover:bg-white/5"
                  onClick={() => toast.success('Master migration applied')}>
                  <RefreshCw className="w-3.5 h-3.5" />Migrate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Location DBs */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Location Databases ({locations.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => {
              const svcCount = services.filter((s) => s.locationId === loc.id).length;
              const repCount = reports.filter((r) => r.locationId === loc.id).length;
              return (
                <div key={loc.id} className="glass-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-8 h-8 p-1.5 rounded-lg shrink-0"
                        style={{ background: 'oklch(0.72 0.16 195 / 0.1)', color: 'oklch(0.72 0.16 195)' }} />
                      <div>
                        <p className="font-semibold text-sm">{loc.name}</p>
                        <code className="text-xs font-mono text-muted-foreground">{loc.slug}</code>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => setDeleteId(loc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.06)' }}>
                      <p className="text-xl font-bold font-mono" style={{ color: 'oklch(0.72 0.16 195)' }}>{svcCount}</p>
                      <p className="text-xs text-muted-foreground">Services</p>
                    </div>
                    <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.06)' }}>
                      <p className="text-xl font-bold font-mono" style={{ color: 'oklch(0.72 0.18 60)' }}>{repCount}</p>
                      <p className="text-xs text-muted-foreground">Reports</p>
                    </div>
                  </div>

                  {lastBackup[loc.id] && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Last backup: <span className="font-mono">{lastBackup[loc.id]}</span>
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs border-white/15 hover:bg-white/5"
                      onClick={() => handleBackup(loc.id, loc.name)}
                    >
                      <Download className="w-3.5 h-3.5" />Backup
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs border-white/15 hover:bg-white/5"
                      onClick={() => handleMigrate(loc.name)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />Migrate
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Location Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-card-solid border-white/15 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Create Location Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">City Name</Label>
              <Input
                placeholder="e.g. Salem"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              {newName && (
                <p className="text-xs text-muted-foreground font-mono">
                  DB: civixa_{newName.toLowerCase().replace(/\s+/g, '_')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}
              style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}>
              Create & Migrate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="glass-card-solid border-white/15">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Database?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the location database for{' '}
              <strong>{locations.find((l) => l.id === deleteId)?.name}</strong>{' '}
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SysInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-mono font-medium">{value}</p>
    </div>
  );
}
