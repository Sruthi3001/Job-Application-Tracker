import { JobApplication } from './types';

const STORAGE_KEY = 'job-tracker-applications';

const SAMPLE_DATA: JobApplication[] = [
  { id: '1', company: 'Google', role: 'Software Engineer Intern', location: 'Mountain View, CA', status: 'interview', dateApplied: '2026-03-10', url: 'https://careers.google.com', notes: 'Completed OA, waiting for on-site', type: 'internship' },
  { id: '2', company: 'Stripe', role: 'Frontend Engineer', location: 'San Francisco, CA', status: 'applied', dateApplied: '2026-03-15', type: 'full-time', salary: '$150k-$180k' },
  { id: '3', company: 'Figma', role: 'Product Design Intern', location: 'Remote', status: 'screening', dateApplied: '2026-03-12', type: 'internship' },
  { id: '4', company: 'Netflix', role: 'Backend Engineer', location: 'Los Gatos, CA', status: 'rejected', dateApplied: '2026-02-28', type: 'full-time' },
  { id: '5', company: 'Notion', role: 'Full Stack Engineer', location: 'New York, NY', status: 'offer', dateApplied: '2026-03-01', salary: '$140k-$160k', type: 'full-time', notes: 'Offer deadline March 30' },
  { id: '6', company: 'Vercel', role: 'Developer Experience', location: 'Remote', status: 'saved', dateApplied: '2026-03-20', type: 'full-time' },
];

export function getApplications(): JobApplication[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
    return SAMPLE_DATA;
  }
  return JSON.parse(stored);
}

export function saveApplications(apps: JobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function addApplication(app: Omit<JobApplication, 'id'>): JobApplication {
  const apps = getApplications();
  const newApp = { ...app, id: crypto.randomUUID() };
  apps.unshift(newApp);
  saveApplications(apps);
  return newApp;
}

export function updateApplication(id: string, updates: Partial<JobApplication>) {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.id === id);
  if (idx !== -1) {
    apps[idx] = { ...apps[idx], ...updates };
    saveApplications(apps);
  }
  return apps;
}

export function deleteApplication(id: string) {
  const apps = getApplications().filter(a => a.id !== id);
  saveApplications(apps);
  return apps;
}
