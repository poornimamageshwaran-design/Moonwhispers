// src/lib/supabaseClient.ts
// Single shared Supabase instance — import this everywhere.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Keep the session alive in localStorage between page reloads
    persistSession: true,
    // Automatically refresh the JWT before it expires
    autoRefreshToken: true,
    // Let Supabase detect the OAuth / magic-link callback from the URL
    detectSessionInUrl: true,
  },
})

// ── Typed helpers ──────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user'

export interface Profile {
  id:         string
  email:      string | null
  role:       UserRole
  created_at: string
  updated_at: string
}

/**
 * Fetch the profile row for the currently-authenticated user.
 * Returns null when there is no session.
 */
export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[getProfile]', error.message)
    return null
  }
  return data as Profile
}

/**
 * Redirect helper — call after login / signup to send the user
 * to the correct dashboard based on their role.
 */
export function redirectByRole(role: UserRole): void {
  if (role === 'admin') {
    window.location.href = '/admin/dashboard'
  } else {
    window.location.href = '/dashboard'
  }
}
