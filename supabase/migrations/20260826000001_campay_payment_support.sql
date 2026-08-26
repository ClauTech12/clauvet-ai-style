-- Support for real MoMo/Orange Money payments via CamPay, alongside the
-- existing WhatsApp/manual-confirm flow (both remain available to customers).

ALTER TABLE public.orders
  ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'whatsapp' CHECK (payment_method IN ('whatsapp', 'campay')),
  ADD COLUMN campay_reference TEXT UNIQUE;

CREATE INDEX idx_orders_campay_reference ON public.orders(campay_reference) WHERE campay_reference IS NOT NULL;

-- The CamPay webhook arrives with no Supabase user session (it's CamPay's own
-- server calling us directly), so it authenticates via the service-role key
-- instead of a user JWT. Service-role connections already bypass RLS
-- entirely in Supabase, so no additional policy is needed here — this
-- comment just documents why the webhook handler uses client.server.ts
-- rather than the regular anon/authenticated client.
