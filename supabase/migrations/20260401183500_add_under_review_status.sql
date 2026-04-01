-- Allow the new "under_review" workflow state in applications.status
-- Drop any existing CHECK constraints on applications.status (name can vary by environment)
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.applications'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.applications DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (
  status IN ('saved', 'applied', 'under_review', 'screening', 'interview', 'offer', 'rejected')
);
