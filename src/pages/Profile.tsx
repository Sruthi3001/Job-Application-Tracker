import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Save, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error(error);
        const fromDb = data?.display_name?.trim();
        if (fromDb) {
          setDisplayName(fromDb);
        } else {
          const fallback =
            (user.user_metadata?.display_name as string | undefined)?.trim() ||
            user.email?.split('@')[0] ||
            '';
          setDisplayName(fallback);
        }
        setLoading(false);
      });
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const trimmedName = displayName.trim();
  const canSave = trimmedName.length > 0;

  const initials = trimmedName
    ? trimmedName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || 'U';

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Display name cannot be empty');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: trimmedName })
      .eq('user_id', user.id);
    if (error) toast.error('Failed to update profile');
    else {
      setDisplayName(trimmedName);
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
        <div className="container max-w-6xl mx-auto flex min-h-14 items-center justify-between px-3 py-2 sm:h-16 sm:px-4 sm:py-0">
          <h1 className="text-lg font-bold tracking-tight">Profile</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <main className="container max-w-lg mx-auto min-w-0 px-3 py-8 space-y-6 sm:px-4 sm:py-10">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user.email || ''} disabled className="pl-9 opacity-60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <p className="text-xs text-muted-foreground">Required — shown on your dashboard greeting.</p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="pl-9"
                  disabled={loading}
                  required
                  minLength={1}
                  aria-invalid={!canSave}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || loading || !canSave} className="w-full gap-1.5">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
