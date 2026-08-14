import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { toast } from 'sonner';

type DbApp = {
  id: string;
  company: string;
  role: string;
  location: string;
  status: string;
  date_applied: string;
  url: string | null;
  notes: string | null;
  salary: string | null;
  type: string;
  resume_url: string | null;
  resume_name: string | null;
  user_id: string;
};

function normalizeStatusFromDb(status: string): ApplicationStatus {
  if (status === 'saved' || status === 'applied' || status === 'screening' || status === 'interview' || status === 'offer' || status === 'rejected') {
    return status;
  }
  // Handle legacy statuses that may still exist in DB.
  if (status === 'under_review' || status === 'under review' || status === 'under-review') {
    return 'applied';
  }
  return 'applied';
}

function toJobApp(row: DbApp): JobApplication {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location,
    status: normalizeStatusFromDb(row.status),
    dateApplied: row.date_applied,
    url: row.url || undefined,
    notes: row.notes || undefined,
    salary: row.salary || undefined,
    type: row.type as JobApplication['type'],
    resumeUrl: row.resume_url || undefined,
    resumeName: row.resume_name || undefined,
  };
}

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    if (!user) { setApplications([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load applications'); console.error(error); }
    else setApplications((data as DbApp[]).map(toJobApp));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const addApplication = async (app: Omit<JobApplication, 'id'>, resumeFile?: File) => {
    if (!user) return;
    let resume_url: string | null = null;
    let resume_name: string | null = null;

    if (resumeFile) {
      const path = `${user.id}/${Date.now()}_${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage.from('resumes').upload(path, resumeFile);
      if (uploadError) { toast.error('Failed to upload resume'); return; }
      resume_url = path;
      resume_name = resumeFile.name;
    }

    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      company: app.company,
      role: app.role,
      location: app.location,
      status: app.status,
      date_applied: app.dateApplied,
      url: app.url || null,
      notes: app.notes || null,
      salary: app.salary || null,
      type: app.type,
      resume_url,
      resume_name,
    });
    if (error) { toast.error(error.message || 'Failed to add application'); console.error(error); }
    else { toast.success('Application added'); await fetchApps(); }
  };

  const updateApplication = async (id: string, updates: Partial<JobApplication>, resumeFile?: File, removeResume?: boolean) => {
    if (!user) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dateApplied !== undefined) dbUpdates.date_applied = updates.dateApplied;
    if (updates.url !== undefined) dbUpdates.url = updates.url || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.salary !== undefined) dbUpdates.salary = updates.salary || null;
    if (updates.type !== undefined) dbUpdates.type = updates.type;

    if (removeResume && !resumeFile) {
      const existing = applications.find(a => a.id === id);
      if (existing?.resumeUrl) {
        await supabase.storage.from('resumes').remove([existing.resumeUrl]);
      }
      dbUpdates.resume_url = null;
      dbUpdates.resume_name = null;
    }

    if (resumeFile) {
      const path = `${user.id}/${Date.now()}_${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage.from('resumes').upload(path, resumeFile);
      if (uploadError) { toast.error('Failed to upload resume'); return; }
      dbUpdates.resume_url = path;
      dbUpdates.resume_name = resumeFile.name;
    }

    const { error } = await supabase.from('applications').update(dbUpdates).eq('id', id);
    if (error) { toast.error(error.message || 'Failed to update'); console.error(error); }
    else { toast.success('Updated'); await fetchApps(); }
  };

  const deleteApplication = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); console.error(error); }
    else { toast.success('Deleted'); await fetchApps(); }
  };

  const deleteApplications = async (ids: string[]) => {
    if (ids.length === 0) return;
    const { error } = await supabase.from('applications').delete().in('id', ids);
    if (error) { toast.error('Failed to delete selected'); console.error(error); }
    else { toast.success(`Deleted ${ids.length} application${ids.length > 1 ? 's' : ''}`); await fetchApps(); }
  };

  return { applications, loading, addApplication, updateApplication, deleteApplication, deleteApplications, refetch: fetchApps };
}
