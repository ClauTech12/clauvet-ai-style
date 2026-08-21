-- This migration must run AFTER 20260819000000_add_super_admin_role.sql, since
-- it references the 'super_admin' enum value added there — Postgres requires
-- new enum values to be committed in their own transaction before use.

-- Helper: true if the user is admin OR super_admin (day-to-day operational access)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;

-- Helper: true only for super_admin (role/staff management, store settings)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;

-- Products: both admin and super_admin can manage (was admin-only before)
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (public.is_staff(auth.uid()));

-- Orders: both admin and super_admin can view/update all orders
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Staff view all orders" ON public.orders FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update orders" ON public.orders FOR UPDATE USING (public.is_staff(auth.uid()));

-- Order items: staff need to see line items for any order (was previously unscoped for admins)
DROP POLICY IF EXISTS "Staff view all order items" ON public.order_items;
CREATE POLICY "Staff view all order items" ON public.order_items FOR SELECT USING (public.is_staff(auth.uid()));

-- Categories: staff can manage (create/edit/delete categories)
DROP POLICY IF EXISTS "Staff manage categories" ON public.categories;
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.is_staff(auth.uid()));

-- Roles: ONLY super_admin can assign/change/remove roles.
-- Regular admins can still see their own role (existing "Users can view own roles" policy stays).
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins manage roles" ON public.user_roles FOR ALL USING (public.is_super_admin(auth.uid()));

-- Customer list: staff can view all profiles (for the Customers admin page)
DROP POLICY IF EXISTS "Staff view all profiles" ON public.profiles;
CREATE POLICY "Staff view all profiles" ON public.profiles FOR SELECT USING (public.is_staff(auth.uid()));
