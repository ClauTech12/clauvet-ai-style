import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Clauvèra" }], links: [{ rel: "canonical", href: "/privacy" }] }),
  component: () => (
    <div className="container mx-auto px-6 py-20 md:py-28 max-w-2xl prose dark:prose-invert">
      <h1 className="font-display text-5xl">Privacy</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>When you create an account, we store your name, email, and the orders you place. When you check out, your order details are shared with us over WhatsApp so we can confirm and deliver it — that conversation lives in WhatsApp, not on our servers.</p>
        <p>We don't sell your data to anyone. We use it only to run your account, process orders, and communicate with you about them.</p>
        <p>Want your data removed or have a question about what we hold? Message us on WhatsApp and we'll sort it out directly with you.</p>
      </div>
    </div>
  ),
});

