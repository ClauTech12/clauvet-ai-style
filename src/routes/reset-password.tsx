import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Clauvèra" }, { name: "robots", content: "noindex" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="container mx-auto px-6 py-24 max-w-md">
      <h1 className="font-display text-4xl text-center">Set a new password</h1>
      <form onSubmit={submit} className="mt-10 space-y-4">
        <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full bg-transparent border border-border rounded-sm h-12 px-4 outline-none focus:border-gold" />
        <button disabled={loading} className="w-full bg-primary text-primary-foreground h-12 rounded-sm text-xs uppercase tracking-luxury">Update password</button>
      </form>
    </div>
  );
}
