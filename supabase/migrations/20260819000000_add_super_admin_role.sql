-- Add super_admin as a distinct role above admin.
-- Split of responsibility:
--   super_admin: manages staff/roles, has full access (implied admin access too)
--   admin: day-to-day operations (products, stock, orders) but cannot manage roles
--
-- NOTE: this new enum value must be committed on its own before anything can
-- reference it (Postgres rule) — that's why the functions/policies that use
-- 'super_admin' live in the NEXT migration file, not this one.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Store each profile's email so staff can look up a user by email when assigning
-- roles, without ever needing client-side access to auth.users (which requires
-- the service-role key and must never be exposed to the browser).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE p.id = u.id AND p.email IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
