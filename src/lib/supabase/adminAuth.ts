import { createAdminSupabaseClient } from "./adminClient";

export async function getUserRoleFromAccessToken(accessToken: string) {
  const supabase = createAdminSupabaseClient();

  const { data: authData, error: authErr } = await supabase.auth.getUser(accessToken);
  if (authErr || !authData?.user) {
    throw new Error("Unauthorized");
  }

  const userId = authData.user.id;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) throw new Error("Failed to load profile");

  return profile?.role ?? "user";
}

