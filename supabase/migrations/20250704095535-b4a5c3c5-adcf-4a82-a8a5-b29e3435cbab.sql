-- Reset the export count for testing
UPDATE public.subscribers 
SET free_exports_used = 0, updated_at = now()
WHERE email = 'rasmus.windblixt@gmail.com';