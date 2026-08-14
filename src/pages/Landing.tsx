import { useMemo } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, BarChart3, Shield, Layers, Home, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MobileDrawerNav } from '@/components/MobileDrawerNav';

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const currentPath = location.pathname + location.search;

  const landingMobileNavItems = useMemo(() => {
    if (!user) return [];
    return [
      { label: 'Home', icon: <Home className="h-4 w-4" />, onSelect: () => navigate('/') },
      { label: 'Dashboard', icon: <Briefcase className="h-4 w-4" />, onSelect: () => navigate('/dashboard') },
      { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, onSelect: () => navigate('/dashboard?tab=analytics') },
      { label: 'Profile', icon: <User className="h-4 w-4" />, onSelect: () => navigate('/profile') },
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
  }, [user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
        <div className="container max-w-6xl mx-auto flex min-h-14 sm:min-h-16 items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="truncate text-base font-bold tracking-tight sm:text-lg">JobTracker</span>
          </div>
          {user ? (
            <>
              <nav className="hidden md:flex shrink-0 flex-wrap items-center justify-end gap-1" aria-label="Main">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className={cn("gap-1.5", currentPath === '/' && "bg-primary/10 text-primary")}>
                  <Home className="h-4 w-4 shrink-0" /> Home
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className={cn("gap-1.5", currentPath.startsWith('/dashboard') && !currentPath.includes('tab=analytics') && "bg-primary/10 text-primary")}>
                  <Briefcase className="h-4 w-4 shrink-0" /> Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard?tab=analytics')} className={cn("gap-1.5", currentPath.includes('tab=analytics') && "bg-primary/10 text-primary")}>
                  <BarChart3 className="h-4 w-4 shrink-0" /> Analytics
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className={cn("gap-1.5", currentPath === '/profile' && "bg-primary/10 text-primary")}>
                  <User className="h-4 w-4 shrink-0" /> Profile
                </Button>
                <Button variant="ghost" size="sm" onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success('Logged out');
                  navigate('/');
                }} className="gap-1.5">
                  <LogOut className="h-4 w-4 shrink-0" /> Logout
                </Button>
              </nav>
              <MobileDrawerNav items={landingMobileNavItems} title="JobTracker" />
            </>
          ) : (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" size="sm" className="px-3" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" className="px-3" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto min-w-0 px-3 py-16 text-center space-y-5 sm:px-4 sm:py-24 sm:space-y-6">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Track Your Job Applications<br />
          <span className="text-primary">All in One Place</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Stay organized throughout your job search. Track applications, monitor progress, and land your dream role faster.
        </p>
        {!user && (
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="gap-2 w-full sm:w-auto">
              Sign In
            </Button>
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 w-full sm:w-auto">
              Sign Up <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="container max-w-6xl mx-auto min-w-0 px-3 pb-16 sm:px-4 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Organize Applications</h3>
            <p className="text-sm text-muted-foreground">
              Keep all your job applications in one place with statuses, notes, and details.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Analytics & Insights</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your progress with charts and stats to optimize your job search.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data is encrypted and only accessible to you. No one else can see your applications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-3 py-6 text-center text-sm text-muted-foreground sm:px-4">
        © {new Date().getFullYear()} JobTracker. Built to help you land your next role.
      </footer>
    </div>
  );
}
