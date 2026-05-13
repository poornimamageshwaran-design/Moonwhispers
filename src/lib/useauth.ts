// src/lib/useAuth.ts
// Drop-in React hook for auth state + profile + role-based redirect.

import { useEffect, useState, useCallback } from 'react'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase, getProfile, redirectByRole } from './supabaseClient'
import type { Profile, UserRole } from './supabaseClient'

interface AuthState {
  user:        User    | null
  profile:     Profile | null
  role:        UserRole | null
  loading:     boolean
  initialized: boolean
}

interface SignUpResult {
  error: string | null
}

interface SignInResult {
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user:        null,
    profile:     null,
    role:        null,
    loading:     true,
    initialized: false,
  })

  // ── Load profile once we have a user ────────────────────────────────────
  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setState(s => ({ ...s, user: null, profile: null, role: null, loading: false, initialized: true }))
      return
    }
    const profile = await getProfile()
    setState(s => ({
      ...s,
      user,
      profile,
      role:        profile?.role ?? null,
      loading:     false,
      initialized: true,
    }))
  }, [])

  // ── Subscribe to auth state changes ─────────────────────────────────────
  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null)
    })

    // Then listen for future changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadProfile(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string
  ): Promise<SignUpResult> => {
    setState(s => ({ ...s, loading: true }))

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setState(s => ({ ...s, loading: false }))
      return { error: friendlyError(error) }
    }

    // If email confirmation is DISABLED in Supabase, the session is live now.
    // If email confirmation is ENABLED, data.session will be null — inform user.
    if (!data.session) {
      setState(s => ({ ...s, loading: false }))
      return { error: null } // caller should show "check your email" message
    }

    // Session is live — profile row was already created by the DB trigger.
    // Re-fetch profile then redirect.
    const profile = await getProfile()
    setState(s => ({ ...s, profile, role: profile?.role ?? null, loading: false }))

    if (profile?.role) {
      redirectByRole(profile.role)
    }

    return { error: null }
  }, [])

  // ── Sign In ──────────────────────────────────────────────────────────────
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<SignInResult> => {
    setState(s => ({ ...s, loading: true }))

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setState(s => ({ ...s, loading: false }))
      return { error: friendlyError(error) }
    }

    // onAuthStateChange will fire and call loadProfile → redirect happens there
    return { error: null }
  }, [])

  // ── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }, [])

  return { ...state, signUp, signIn, signOut }
}

// ── Map Supabase error codes → human-readable strings ───────────────────────
function friendlyError(error: AuthError): string {
  // Supabase wraps Postgres errors in the message string
  const msg = error.message ?? ''

  if (msg.includes('Database error saving new user')) {
    return 'Account creation failed due to a server configuration issue. Please contact support.'
  }
  if (msg.includes('User already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  if (msg.includes('Unable to validate email address')) {
    return 'Please enter a valid email address.'
  }
  // Fallback — show raw message in dev, generic in prod
  return import.meta.env.DEV
    ? `Auth error: ${msg}`
    : 'Something went wrong. Please try again.'
}
