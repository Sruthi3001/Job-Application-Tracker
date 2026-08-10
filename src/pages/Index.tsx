import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { Plus, Search, Briefcase, LogOut, BarChart3, User, Home, Trash2 } from 'lucide-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MobileDrawerNav } from '@/components/MobileDrawerNav';
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

/** Trim + lowercase so filter options dedupe (e.g. "Remote" vs "remote "). */
function dedupeKey(value: string): string {
  return value.trim().toLowerCase();
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { applications, loading, addApplication, updateApplication, deleteApplication, deleteApplications } = useApplications();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const [displayName, setDisplayName] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const showAnalytics = location.search.includes('tab=analytics');

  const openAddDialog = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const mobileNavItems = useMemo(() => {
    const analyticsPath = showAnalytics ? '/dashboard' : '/dashboard?tab=analytics';
    return [
      { label: 'Home', icon: <Home className="h-4 w-4" />, onSelect: () => navigate('/') },
      { label: 'Dashboard', icon: <Briefcase className="h-4 w-4" />, onSelect: () => navigate('/dashboard') },
      { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, onSelect: () => navigate(analyticsPath) },
      { label: 'Profile', icon: <User className="h-4 w-4" />, onSelect: () => navigate('/profile') },
      { label: 'Add application', icon: <Plus className="h-4 w-4" />, onSelect: openAddDialog },
      {
        label: 'Sign out',
        icon: <LogOut className="h-4 w-4" />,
        onSelect: async () => {
          await supabase.auth.signOut();
          toast.success('Logged out');
          navigate('/');
        },
      },
    ];
  }, [navigate, showAnalytics, openAddDialog]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const name =
        data?.display_name ||
        (user.user_metadata?.display_name as string | undefined) ||
        (user.email ? user.email.split('@')[0] : '');

      if (!cancelled) setDisplayName(name || '');
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const uniqueCompanies = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const a of applications) {
      const label = (a.company ?? '').trim();
      const key = dedupeKey(label);
      if (!key) continue;
      if (!byKey.has(key)) {
        byKey.set(key, label);
      }
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const uniqueLocations = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const a of applications) {
      const label = (a.location ?? '').trim();
      const key = dedupeKey(label);
      if (!key) continue;
      if (!byKey.has(key)) {
        byKey.set(key, label);
      }
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch =
        !search ||
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      const matchesCompany =
        companyFilter === 'all' || dedupeKey(a.company) === dedupeKey(companyFilter);
      const matchesLocation =
        locationFilter === 'all' || dedupeKey(a.location) === dedupeKey(locationFilter);
      return matchesSearch && matchesStatus && matchesType && matchesCompany && matchesLocation;
    });
  }, [applications, search, statusFilter, typeFilter, companyFilter, locationFilter]);

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

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const toggleSelectAll = (checked: boolean) => {
    const visibleIds = filtered.map(a => a.id);
    setSelectedIds(prev =>
      checked ? Array.from(new Set([...prev, ...visibleIds])) : prev.filter(id => !visibleIds.includes(id))
    );
  };

  const confirmBulkDelete = async () => {
    await deleteApplications(selectedIds);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
        <div className="container max-w-6xl mx-auto flex min-h-14 sm:min-h-16 items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">JobTracker</h1>
          </div>
          <nav className="hidden md:flex shrink-0 flex-wrap items-center justify-end gap-1" aria-label="Main">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className={cn("gap-1.5", currentPath === '/' && "bg-primary/10 text-primary")}>
              <Home className="h-4 w-4 shrink-0" /> Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className={cn("gap-1.5", currentPath === '/dashboard' && !showAnalytics && "bg-primary/10 text-primary")}>
              <Briefcase className="h-4 w-4 shrink-0" /> Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(showAnalytics ? '/dashboard' : '/dashboard?tab=analytics')} className={cn("gap-1.5", showAnalytics && "bg-primary/10 text-primary")}>
              <BarChart3 className="h-4 w-4 shrink-0" /> Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className={cn("gap-1.5", currentPath === '/profile' && "bg-primary/10 text-primary")}>
              <User className="h-4 w-4 shrink-0" /> Profile
            </Button>
            <Button onClick={openAddDialog} className="gap-1.5" size="sm">
              <Plus className="h-4 w-4 shrink-0" /> Add
            </Button>
            <Button variant="ghost" size="icon" onClick={async () => {
              await supabase.auth.signOut();
              toast.success('Logged out');
              navigate('/');
            }} title="Sign out" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
          <MobileDrawerNav items={mobileNavItems} title="JobTracker" />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto min-w-0 px-3 pb-10 pt-6 sm:px-4 sm:py-8 space-y-6">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight break-words sm:text-2xl">
            {displayName ? `Hi, ${displayName}` : 'Hi'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Track and manage your job applications</p>
        </div>

        <StatsCards applications={applications} />

        {showAnalytics && <AnalyticsCharts applications={applications} />}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search company, role, or location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[150px]">
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
            <SelectTrigger className="h-10 w-full sm:w-[150px]">
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
            <SelectTrigger className="h-10 w-full sm:w-[150px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {uniqueCompanies.map(c => (
                <SelectItem key={dedupeKey(c)} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[160px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {uniqueLocations.map(loc => (
                <SelectItem key={dedupeKey(loc)} value={loc}>{loc}</SelectItem>
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
