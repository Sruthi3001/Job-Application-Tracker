import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, BarChart3, Shield, Layers, Home, User, LogOut, Sparkles, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname + location.search;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className={cn("flex items-center gap-2.5 transition-all duration-700", mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center animate-pulse">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">JobTracker</span>
          </div>
          <div className={cn("flex items-center gap-1 transition-all duration-700 delay-200", mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4")}>
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/')} className={cn("gap-1.5", currentPath === '/' && "bg-primary/10 text-primary")}>
                  <Home className="h-4 w-4" /> Home
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className={cn("gap-1.5", currentPath === '/dashboard' && "bg-primary/10 text-primary")}>
                  <Briefcase className="h-4 w-4" /> Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard?tab=analytics')} className={cn("gap-1.5", currentPath === '/dashboard?tab=analytics' && "bg-primary/10 text-primary")}>
                  <BarChart3 className="h-4 w-4" /> Analytics
                </Button>
                <Button variant="ghost" onClick={() => navigate('/profile')} className={cn("gap-1.5", currentPath === '/profile' && "bg-primary/10 text-primary")}>
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
      <section className="relative container max-w-6xl mx-auto px-4 py-28 text-center space-y-8">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-primary/5 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite_1s]" />
        
        <div className={cn("relative transition-all duration-1000 delay-300", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            Your job search, simplified
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Track Your Job Applications<br />
            <span className="text-primary relative">
              All in One Place
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" className={cn("transition-all duration-1000 delay-700", mounted ? "opacity-100" : "opacity-0")} style={{ strokeDasharray: 300, strokeDashoffset: mounted ? 0 : 300, transition: 'stroke-dashoffset 1.5s ease-out 0.8s, opacity 0.3s ease-out 0.8s' }} />
              </svg>
            </span>
          </h1>
        </div>

        <p className={cn("text-lg text-muted-foreground max-w-2xl mx-auto relative transition-all duration-1000 delay-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          Stay organized throughout your job search. Track applications, monitor progress, and land your dream role faster.
        </p>

        {!user && (
          <div className={cn("flex justify-center gap-3 pt-2 relative transition-all duration-1000 delay-700", mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95")}>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="gap-2 hover:scale-105 transition-transform duration-200">
              Sign In
            </Button>
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 hover:scale-105 transition-transform duration-200 shadow-lg shadow-primary/25">
              Sign Up <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Stats bar */}
      <section className={cn("container max-w-4xl mx-auto px-4 pb-16 transition-all duration-1000 delay-[900ms]", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
        <div className="flex justify-center gap-12 py-6 rounded-2xl border bg-card/80 backdrop-blur-sm">
          {[
            { icon: Target, label: "Track Applications", value: "Unlimited" },
            { icon: Zap, label: "Real-time Analytics", value: "Instant" },
            { icon: Shield, label: "Data Security", value: "Encrypted" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 text-center group">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <stat.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container max-w-6xl mx-auto px-4 pb-24">
        <div className={cn("text-center mb-12 transition-all duration-1000 delay-[1000ms]", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-2">Powerful tools to supercharge your job search</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: "Organize Applications",
              description: "Keep all your job applications in one place with statuses, notes, and details.",
              delay: "delay-[1100ms]",
            },
            {
              icon: BarChart3,
              title: "Analytics & Insights",
              description: "Visualize your progress with charts and stats to optimize your job search.",
              delay: "delay-[1200ms]",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Your data is encrypted and only accessible to you. No one else can see your applications.",
              delay: "delay-[1300ms]",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border bg-card p-6 space-y-3 group hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500",
                "transition-all duration-1000",
                feature.delay,
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className={cn("container max-w-4xl mx-auto px-4 pb-24 transition-all duration-1000 delay-[1400ms]", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="relative rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-primary/5 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
            <div className="relative space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Join thousands of job seekers who are already tracking their applications smarter.
              </p>
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 mt-4 hover:scale-105 transition-transform duration-200 shadow-lg shadow-primary/25">
                Start Tracking Now <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JobTracker. Built to help you land your next role.
      </footer>
    </div>
  );
}
