import { ApplicationStatus, STATUS_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.colorClass)}>
      {config.label}
    </span>
  );
}
