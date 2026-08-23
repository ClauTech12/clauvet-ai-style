import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Clauvèra" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Check your email to confirm"); navigate({ to: "/login" }); }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) toast.error(error.message ?? "Sign-in failed");
  };

  return (
    <div className="container mx-auto px-6 py-16 md:py-24 max-w-md">
      <h1 className="font-display text-4xl md:text-5xl text-center">{t.auth.signUpTitle}</h1>
      <form onSubmit={submit} className="mt-10 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-luxury">{t.auth.fullName}</label>
          <input required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-2 w-full bg-transparent border border-border rounded-sm h-12 px-4 outline-none focus:border-gold" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-luxury">{t.auth.email}</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full bg-transparent border border-border rounded-sm h-12 px-4 outline-none focus:border-gold" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-luxury">{t.auth.password}</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full bg-transparent border border-border rounded-sm h-12 px-4 outline-none focus:border-gold" />
        </div>
        <button disabled={loading} className="w-full bg-primary text-primary-foreground h-12 rounded-sm text-xs uppercase tracking-luxury">{t.auth.signUp}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-luxury text-muted-foreground">
        <span className="flex-1 border-t border-border" /> {t.auth.or} <span className="flex-1 border-t border-border" />
      </div>
      <button onClick={google} className="w-full border border-border h-12 rounded-sm text-xs uppercase tracking-luxury hover:border-foreground transition">
        {t.auth.withGoogle}
      </button>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.haveAccount} <Link to="/login" className="text-foreground underline">{t.auth.signIn}</Link>
      </p>
    </div>
  );
}
