import { useState, useEffect } from 'react';
import { AlertTriangle, X, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useData } from '../context/DataContext';
import { useSession } from '../context/SessionContext';
import { toast } from 'sonner';
import { KEYS } from '../lib/storage';

const COOLDOWN_SECONDS = 60;

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  defaultLocationId?: string;
}

export function ReportDialog({ open, onClose, defaultLocationId }: ReportDialogProps) {
  const { locations, services, submitReport } = useData();
  const { session } = useSession();

  const [locationId, setLocationId] = useState(defaultLocationId ?? '');
  const [serviceId, setServiceId] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(session?.email ?? '');
  const [agreed, setAgreed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const locationServices = services.filter((s) => s.locationId === locationId);

  // Check existing cooldown
  useEffect(() => {
    if (!open) return;
    const lastTime = localStorage.getItem(KEYS.LAST_REPORT_TIME);
    if (lastTime) {
      const elapsed = Math.floor((Date.now() - parseInt(lastTime, 10)) / 1000);
      const remaining = COOLDOWN_SECONDS - elapsed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (defaultLocationId) setLocationId(defaultLocationId);
  }, [defaultLocationId]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
  const canSubmit = locationId && serviceId && area.trim() && description.trim() && isEmailValid && agreed && cooldown === 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    submitReport({ locationId, serviceId, area: area.trim(), description: description.trim(), contactEmail });
    localStorage.setItem(KEYS.LAST_REPORT_TIME, Date.now().toString());
    setCooldown(COOLDOWN_SECONDS);

    toast.success('Report submitted — thank you! A moderator will review it shortly.');
    onClose();
    // Reset
    setServiceId('');
    setArea('');
    setDescription('');
    setAgreed(false);
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card-solid border-white/15 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="w-4 h-4 text-warning-status" />
            Report a Civic Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Disclaimer */}
          <div className="rounded-lg p-3 text-xs text-muted-foreground leading-relaxed"
            style={{ background: 'oklch(0.72 0.18 60 / 0.08)', border: '1px solid oklch(0.72 0.18 60 / 0.2)' }}>
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 align-text-top text-warning-status" />
            This platform displays community-reported information. Reports are reviewed by moderators but are not officially verified by authorities.
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Location</Label>
            <Select value={locationId} onValueChange={(v) => { setLocationId(v); setServiceId(''); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select city…" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Affected Service</Label>
            <Select value={serviceId} onValueChange={setServiceId} disabled={!locationId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select service…" />
              </SelectTrigger>
              <SelectContent>
                {locationServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.serviceName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Area / Locality</Label>
            <Input
              placeholder="e.g. Adyar, T. Nagar…"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-9"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              placeholder="Describe the issue clearly…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-24 text-sm"
              maxLength={500}
            />
            <p className="text-right text-xs text-muted-foreground">{description.length}/500</p>
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Contact Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="h-9"
            />
            {contactEmail && !isEmailValid && (
              <p className="text-xs text-destructive">Please enter a valid email address</p>
            )}
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="agree-report"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
              className="mt-0.5"
            />
            <Label htmlFor="agree-report" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I understand this is a community report and not official. I confirm the information is accurate to the best of my knowledge.
            </Label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {cooldown > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Next report in {cooldown}s</span>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={onClose} type="button">
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                type="button"
                style={{ background: 'oklch(0.5 0.18 255)', color: 'white' }}
              >
                <Send className="w-4 h-4 mr-1.5" />
                {submitting ? 'Submitting…' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
