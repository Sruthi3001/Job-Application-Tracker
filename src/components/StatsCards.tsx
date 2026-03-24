import { JobApplication } from '@/lib/types';
import { Briefcase, Send, MessageSquare, Trophy, XCircle, Bookmark } from 'lucide-react';

const stats = [
  { key: 'total', label: 'Total', icon: Briefcase, colorClass: 'text-foreground' },
  { key: 'applied', label: 'Applied', icon: Send, colorClass: 'text-status-applied' },
  { key: 'screening', label: 'Screening', icon: MessageSquare, colorClass: 'text-status-screening' },
  { key: 'interview', label: 'Interview', icon: MessageSquare, colorClass: 'text-status-interview' },
  { key: 'offer', label: 'Offers', icon: Trophy, colorClass: 'text-status-offer' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, colorClass: 'text-status-rejected' },
] as const;

export function StatsCards({ applications }: { applications: JobApplication[] }) {
  const counts: Record<string, number> = { total: applications.length };
  applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.key} className="rounded-xl border bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${s.colorClass}`} />
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">{counts[s.key] || 0}</span>
          </div>
        );
      })}
    </div>
  );
}
