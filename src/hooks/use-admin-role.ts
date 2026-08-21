import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/**
 * Two-tier admin access:
 *  - isStaff: admin OR super_admin — day-to-day operations (products, stock, orders, customers)
 *  - isSuperAdmin: super_admin only — staff/role management
 */
export function useAdminRole() {
  const { user, loading: authLoading } = useAuth();

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["adminRole", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .in("role", ["admin", "super_admin"]);
      if (!data || data.length === 0) return null;
      return data.some(r => r.role === "super_admin") ? "super_admin" : "admin";
    },
    enabled: !!user,
  });

  return {
    user,
    loading: authLoading || (!!user && roleLoading),
    isStaff: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
  };
}
