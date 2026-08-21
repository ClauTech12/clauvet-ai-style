-- Fix: the previous migration revoked EXECUTE on is_staff() and is_super_admin()
-- from the 'authenticated' role. That broke every RLS policy that calls these
-- functions — Postgres requires the querying role to have EXECUTE permission
-- on a function used inside a policy, even though the function itself runs as
-- SECURITY DEFINER. The result was every staff check silently evaluating to
-- false, sending Super Admins back to the regular dashboard.
--
-- This matches the original has_role() function, which never restricted
-- EXECUTE and has always worked correctly.
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
