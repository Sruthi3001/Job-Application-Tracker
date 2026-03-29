import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCards } from '@/components/StatsCards';
import { ApplicationTable } from '@/components/ApplicationTable';
import { ApplicationDialog } from '@/components/ApplicationDialog';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { Plus, Search, Briefcase, LogOut, BarChart3, User, Home } from 'lucide-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { applications, loading, addApplication, updateApplication, deleteApplication } = useApplications();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const uniqueCompanies = useMemo(() => {
    const companies = [...new Set(applications.map(a => a.company))].sort();
    return companies;
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = !search || a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      const matchesCompany = companyFilter === 'all' || a.company === companyFilter;
      return matchesSearch && matchesStatus && matchesType && matchesCompany;
    });
  }, [applications, search, statusFilter, typeFilter, companyFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = (data: Omit<JobApplication, 'id'>, resumeFile?: File) => {
    if (editing) {
      updateApplication(editing.id, data, resumeFile);
    } else {
      addApplication(data, resumeFile);
    }
    setEditing(null);
  };

  const handleEdit = (app: JobApplication) => { setEditing(app); setDialogOpen(true); };
  const handleDelete = (id: string) => deleteApplication(id);
  const handleStatusChange = (id: string, status: ApplicationStatus) => updateApplication(id, { status });

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5">
              <Home className="h-4 w-4" /> Home
            </Button>
            <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnalytics(!showAnalytics)} className="gap-1.5">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="gap-1.5">
              <UserCircle className="h-4 w-4" /> Profile
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
        </div>

        <StatsCards applications={applications} />

        {showAnalytics && <AnalyticsCharts applications={applications} />}

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {uniqueCompanies.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <ApplicationTable applications={filtered} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        )}
      </main>

      <ApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} application={editing} onSave={handleSave} />
    </div>
  );
};

export default Index;
