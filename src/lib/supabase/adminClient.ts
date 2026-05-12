import { createClient } from "@supabase/supabase-js";

export function createAdminSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  // Server/admin operations should not persist session.
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

