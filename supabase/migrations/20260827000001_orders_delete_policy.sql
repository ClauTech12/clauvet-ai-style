-- Staff (admin or super_admin) can delete orders — needed for cleaning up
-- test/duplicate/mistaken orders. order_items already cascade-delete when
-- their parent order is removed (ON DELETE CASCADE from the original
-- schema), so no separate policy is needed there.

CREATE POLICY "Staff delete orders" ON public.orders FOR DELETE
  USING (public.is_staff(auth.uid()));
