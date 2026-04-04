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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex flex-col gap-1 rounded-xl border bg-card p-3 sm:p-4">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <Icon className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${s.colorClass}`} />
              <span className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">{s.label}</span>
            </div>
            <span className="text-xl font-bold tracking-tight sm:text-2xl">{counts[s.key] || 0}</span>
          </div>
        );
      })}
    </div>
  );
}
