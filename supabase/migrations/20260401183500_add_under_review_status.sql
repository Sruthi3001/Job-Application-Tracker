-- Allow the new "under_review" workflow state in applications.status
ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (
  status IN ('saved', 'applied', 'under_review', 'screening', 'interview', 'offer', 'rejected')
);
