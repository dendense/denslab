import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string | null;
  isAdmin: boolean;
};

/**
 * Reads the signed-in user and their role from `profiles`. Returns `null` when
 * nobody is signed in or Supabase is not configured.
 *
 * The role lives in the database and is read per request, so revoking admin
 * access takes effect immediately rather than persisting in a token.
 */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();

  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    isAdmin: profile?.role === "admin",
  };
}
