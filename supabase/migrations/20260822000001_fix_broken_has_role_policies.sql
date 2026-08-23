-- Two RLS policies from the original schema still reference has_role(), which
-- lost its EXECUTE grant in migration 20260516031640 and was never restored.
-- Any query that has to evaluate these policies fails with
-- "permission denied for function has_role" (42501) — even when the actual
-- access should be granted via a different, working policy, because Postgres
-- checks function-execute permissions for every policy attached to the
-- operation, not just the one that would ultimately decide the outcome.
--
-- Staff/admin access to both tables is already covered by the newer
-- is_staff()-based policies added in 20260819000001_super_admin_policies.sql,
-- so we drop the broken legacy ones outright and simplify the customer-facing
-- order_items policy to just check order ownership.

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;

DROP POLICY IF EXISTS "Order items via order" ON public.order_items;
CREATE POLICY "Order items via order" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
