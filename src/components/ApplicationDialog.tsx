import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { FileText, Upload, X } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: JobApplication | null;
  onSave: (data: Omit<JobApplication, 'id'>, resumeFile?: File) => void;
}

const defaultForm = {
  company: '', role: '', location: '', status: 'applied' as ApplicationStatus,
  dateApplied: new Date().toISOString().split('T')[0], url: '', notes: '', salary: '',
  type: 'full-time' as JobApplication['type'],
};

export function ApplicationDialog({ open, onOpenChange, application, onSave }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (application) {
      setForm({ company: application.company, role: application.role, location: application.location, status: application.status, dateApplied: application.dateApplied, url: application.url || '', notes: application.notes || '', salary: application.salary || '', type: application.type });
    } else {
      setForm(defaultForm);
    }
    setResumeFile(null);
  }, [application, open]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{application ? 'Edit Application' : 'Add Application'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. SWE Intern" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Remote" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input id="dateApplied" type="date" value={form.dateApplied} onChange={e => set('dateApplied', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. $150k" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">Job URL</Label>
            <Input id="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..." />
          </div>

          {/* Resume Upload */}
          <div className="space-y-1.5">
            <Label>Resume</Label>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { if (e.target.files?.[0]) setResumeFile(e.target.files[0]); }} />
            {resumeFile ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate flex-1">{resumeFile.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setResumeFile(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : application?.resumeName ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate flex-1">{application.resumeName}</span>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> Replace
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload Resume (PDF, DOC)
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this application..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { if (form.company && form.role) { onSave(form, resumeFile || undefined); onOpenChange(false); } }} disabled={!form.company || !form.role}>
            {application ? 'Save Changes' : 'Add Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
