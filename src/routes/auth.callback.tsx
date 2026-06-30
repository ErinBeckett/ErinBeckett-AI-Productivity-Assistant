import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  beforeLoad: async () => {
    // OAuth completes via @lovable.dev/cloud-auth-js setSession; wait briefly.
    for (let i = 0; i < 20; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) throw redirect({ to: "/_authenticated/app/email" });
      await new Promise((r) => setTimeout(r, 100));
    }
    throw redirect({ to: "/auth" });
  },
  component: () => null,
});
