'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setMessage(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#080810',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{
        border: '1px solid rgba(0,245,255,0.3)', padding: '48px',
        width: '100%', maxWidth: '400px', background: '#0e0e1a'
      }}>
        <h1 style={{ color: '#00F5FF', fontSize: '14px', letterSpacing: '2px', marginBottom: '32px', textTransform: 'uppercase' }}>
          // Reset Password
        </h1>

        {sent ? (
          <p style={{ color: '#00F5FF', fontSize: '13px', lineHeight: '1.6' }}>
            Reset link sent. Check your email — it may take a minute.
          </p>
        ) : (
          <>
            <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px', marginBottom: '24px', lineHeight: '1.6' }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
            <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
              {loading ? 'sending...' : 'Send Reset Link →'}
            </button>
            {message && (
              <p style={{ color: '#FF2D78', fontSize: '12px', marginTop: '16px' }}>{message}</p>
            )}
          </>
        )}

        <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px', marginTop: '24px' }}>
          <Link href="/login" style={{ color: '#00F5FF', textDecoration: 'none' }}>← Back to sign in</Link>
        </p>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%', background: '#080810',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEFF', padding: '12px 16px', marginBottom: '12px',
  fontFamily: 'monospace', fontSize: '14px', outline: 'none', display: 'block',
  boxSizing: 'border-box',
}

const btnStyle = {
  width: '100%', background: '#FF2D78', color: '#fff',
  border: 'none', padding: '14px', fontFamily: 'monospace',
  fontSize: '13px', cursor: 'pointer', letterSpacing: '1px', marginTop: '8px',
}
