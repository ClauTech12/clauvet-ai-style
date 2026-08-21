import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns — Clauvèra" }], links: [{ rel: "canonical", href: "/returns" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl">
      <h1 className="font-display text-5xl">Returns</h1>
      <p className="mt-6 text-muted-foreground">
        We check every order before it leaves us, but if something's wrong on our end, we'll make it right.
      </p>
      <p className="mt-4 text-muted-foreground">
        If you receive a defective item or the wrong item, message us on WhatsApp within 48 hours of delivery with a photo of the item. We'll arrange a free replacement or a full refund — no cost to you.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Outside of a defect or a mix-up on our end, all sales are final. We don't currently offer returns for change of mind, so please check sizing and details carefully before confirming your order.
      </p>
    </div>
  ),
});

