import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Header, MobileBottomBar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AIStylistFloat } from "@/components/layout/AIStylistFloat";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-3 text-xs uppercase tracking-luxury text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-primary px-5 py-3 text-xs uppercase tracking-luxury text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clauvèra — Style Powered by Intelligence" },
      { name: "description", content: "Clauvèra is the futuristic luxury fashion marketplace where AI curates a wardrobe worthy of you." },
      { name: "author", content: "Clauvèra" },
      { property: "og:title", content: "Clauvèra — Style Powered by Intelligence" },
      { property: "og:description", content: "Clauvèra is the futuristic luxury fashion marketplace where AI curates a wardrobe worthy of you." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Clauvèra" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0a0a0f" },
      { name: "twitter:title", content: "Clauvèra — Style Powered by Intelligence" },
      { name: "twitter:description", content: "Clauvèra is the futuristic luxury fashion marketplace where AI curates a wardrobe worthy of you." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/58cb325e-e352-495f-a1a2-a7b5899b78dd/id-preview-c184072c--12bb9a4c-5b48-4a74-ad9d-2eb1c0ba793a.lovable.app-1780330886351.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/58cb325e-e352-495f-a1a2-a7b5899b78dd/id-preview-c184072c--12bb9a4c-5b48-4a74-ad9d-2eb1c0ba793a.lovable.app-1780330886351.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthSync />
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1 pb-20 md:pb-0">
              <Outlet />
            </main>
            <Footer />
            <MobileBottomBar />
            <WhatsAppFloat />
            <AIStylistFloat />
            <Toaster richColors position="top-center" />
          </div>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
