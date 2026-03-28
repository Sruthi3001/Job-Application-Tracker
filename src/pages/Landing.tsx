import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, BarChart3, Shield, Layers, Home, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">JobTracker</span>
          </div>
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/')} className="gap-1.5">
                  <Home className="h-4 w-4" /> Home
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-1.5">
                  <Briefcase className="h-4 w-4" /> Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard?tab=analytics')} className="gap-1.5">
                  <BarChart3 className="h-4 w-4" /> Analytics
                </Button>
                <Button variant="ghost" onClick={() => navigate('/profile')} className="gap-1.5">
                  <User className="h-4 w-4" /> Profile
                </Button>
                <Button variant="ghost" onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success('Logged out');
                  navigate('/');
                }} className="gap-1.5">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Track Your Job Applications<br />
          <span className="text-primary">All in One Place</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay organized throughout your job search. Track applications, monitor progress, and land your dream role faster.
        </p>
        {!user && (
          <div className="flex justify-center gap-3 pt-2">
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="gap-2">
              Sign In
            </Button>
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              Sign Up <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="container max-w-6xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
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
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JobTracker. Built to help you land your next role.
      </footer>
    </div>
  );
}
