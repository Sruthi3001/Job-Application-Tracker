import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCards } from '@/components/StatsCards';
import { ApplicationTable } from '@/components/ApplicationTable';
import { ApplicationDialog } from '@/components/ApplicationDialog';
import { getApplications, addApplication, updateApplication, deleteApplication } from '@/lib/store';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { Plus, Search, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [applications, setApplications] = useState<JobApplication[]>(getApplications);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = !search || a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const handleSave = (data: Omit<JobApplication, 'id'>) => {
    if (editing) {
      const updated = updateApplication(editing.id, data);
      setApplications(updated);
      toast.success('Application updated');
    } else {
      addApplication(data);
      setApplications(getApplications());
      toast.success('Application added');
    }
    setEditing(null);
  };

  const handleEdit = (app: JobApplication) => { setEditing(app); setDialogOpen(true); };

  const handleDelete = (id: string) => {
    const updated = deleteApplication(id);
    setApplications(updated);
    toast.success('Application deleted');
  };

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    const updated = updateApplication(id, { status });
    setApplications(updated);
    toast.success('Status updated');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">JobTracker</h1>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
        </div>

        <StatsCards applications={applications} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ApplicationTable applications={filtered} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
      </main>

      <ApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} application={editing} onSave={handleSave} />
    </div>
  );
};

export default Index;
