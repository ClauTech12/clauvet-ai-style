-- Storage bucket for product photos. Public read (storefront needs to display
-- them to anyone), staff-only write (only admin/super_admin can upload,
-- replace, or delete product images from the admin panel).
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Product images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Staff can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));
