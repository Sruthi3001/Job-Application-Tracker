export type ApplicationStatus = 'saved' | 'applied' | 'under_review' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  dateApplied: string;
  url?: string;
  notes?: string;
  salary?: string;
  type: 'full-time' | 'internship' | 'contract' | 'part-time';
  resumeUrl?: string;
  resumeName?: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; colorClass: string }> = {
  saved: { label: 'Saved', colorClass: 'bg-status-saved/15 text-status-saved border-status-saved/30' },
  applied: { label: 'Applied', colorClass: 'bg-status-applied/15 text-status-applied border-status-applied/30' },
  under_review: { label: 'Under Review', colorClass: 'bg-status-under-review/15 text-status-under-review border-status-under-review/30' },
  screening: { label: 'Screening', colorClass: 'bg-status-screening/15 text-status-screening border-status-screening/30' },
  interview: { label: 'Interview', colorClass: 'bg-status-interview/15 text-status-interview border-status-interview/30' },
  offer: { label: 'Offer', colorClass: 'bg-status-offer/15 text-status-offer border-status-offer/30' },
  rejected: { label: 'Rejected', colorClass: 'bg-status-rejected/15 text-status-rejected border-status-rejected/30' },
};
