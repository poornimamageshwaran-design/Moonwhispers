// src/components/ProtectedRoute.tsx
// Wrap any page that requires authentication (and optionally a specific role).
//
// Usage:
//   <ProtectedRoute>              → any logged-in user
//   <ProtectedRoute role="admin"> → admins only

import React from 'react'
import { useAuth } from '../lib/useAuth'
import type { UserRole } from '../lib/supabaseClient'

interface Props {
  children:  React.ReactNode
  role?:     UserRole   // if supplied, only that role can access
  fallback?: React.ReactNode  // shown while loading
}

export default function ProtectedRoute({ children, role, fallback }: Props) {
  const { user, profile, loading, initialized } = useAuth()

  // ── Still resolving session ──────────────────────────────────────────────
  if (!initialized || loading) {
    return fallback
      ? <>{fallback}</>
      : <LoadingSpinner />
  }

  // ── Not logged in → go to login page ────────────────────────────────────
  if (!user) {
    window.location.href = '/'
    return null
  }

  // ── Wrong role → go to their own dashboard ───────────────────────────────
  if (role && profile?.role !== role) {
    window.location.href = profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return null
  }

  return <>{children}</>
}

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
      color: '#8b949e',
      fontSize: '1rem',
    }}>
      Loading…
    </div>
  )
}
