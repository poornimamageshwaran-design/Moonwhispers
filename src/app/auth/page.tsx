// src/components/AuthForm.tsx
// Drop-in replacement for your existing Sign In / Sign Up form.
// Matches the dark-mode design visible in the screenshot.

import React, { useState } from 'react'
import { useAuth } from '../lib/useAuth'

type Tab = 'signin' | 'signup'

export default function AuthForm() {
  const { signIn, signUp, loading } = useAuth()

  const [tab,      setTab]      = useState<Tab>('signup')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [info,     setInfo]     = useState<string | null>(null)  // e.g. "check your email"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    // Basic client-side validation
    if (!email.trim()) { setError('Email is required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    if (tab === 'signup') {
      const { error: err } = await signUp(email.trim(), password)
      if (err) {
        setError(err)
      } else {
        // If Supabase email confirmation is ON, session won't exist yet
        setInfo('Account created! Check your email to confirm, then sign in.')
      }
      // If confirmation is OFF, useAuth redirects automatically via redirectByRole()
    } else {
      const { error: err } = await signIn(email.trim(), password)
      if (err) setError(err)
      // On success, useAuth's onAuthStateChange fires → loadProfile → redirectByRole()
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Join us</h1>
      <p style={styles.subtitle}>Create an account to get started.</p>

      <div style={styles.card}>
        {/* ── Tab switcher ── */}
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); setInfo(null) }}
            style={tab === 'signin' ? styles.tabActive : styles.tabInactive}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); setInfo(null) }}
            style={tab === 'signup' ? styles.tabActive : styles.tabInactive}
          >
            Sign up
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={styles.input}
            autoComplete="email"
          />

          <label style={styles.label}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={styles.input}
            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
          />

          {/* Error banner */}
          {error && (
            <div style={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          {/* Info banner */}
          {info && (
            <div style={styles.infoBanner} role="status">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.submitBtn, opacity: 0.6 } : styles.submitBtn}
          >
            {loading
              ? (tab === 'signup' ? 'Creating account…' : 'Signing in…')
              : (tab === 'signup' ? 'Create account'    : 'Sign in')}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Inline styles matching the dark-mode screenshot ──────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0d1117',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#e6edf3',
    padding: '24px',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontSize: '2.5rem',
    marginBottom: '8px',
    fontWeight: 400,
  },
  subtitle: {
    color: '#8b949e',
    marginBottom: '32px',
    fontSize: '0.95rem',
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '480px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '28px',
    background: '#0d1117',
    borderRadius: '10px',
    padding: '4px',
  },
  tabActive: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: '#1f6feb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  tabInactive: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#8b949e',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#8b949e',
    marginTop: '12px',
    marginBottom: '6px',
  },
  input: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#e6edf3',
    fontSize: '0.95rem',
    padding: '12px 14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  errorBanner: {
    marginTop: '16px',
    background: 'rgba(248,81,73,0.15)',
    border: '1px solid rgba(248,81,73,0.4)',
    borderRadius: '8px',
    color: '#f85149',
    padding: '12px 16px',
    fontSize: '0.9rem',
  },
  infoBanner: {
    marginTop: '16px',
    background: 'rgba(31,111,235,0.15)',
    border: '1px solid rgba(31,111,235,0.4)',
    borderRadius: '8px',
    color: '#79c0ff',
    padding: '12px 16px',
    fontSize: '0.9rem',
  },
  submitBtn: {
    marginTop: '24px',
    background: '#1f6feb',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.2s',
  },
}
