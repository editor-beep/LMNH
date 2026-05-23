'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (password !== confirm) { setMessage('Passwords do not match.'); return }
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else {
      setDone(true)
      setTimeout(() => { window.location.href = '/feed' }, 2500)
    }
    setLoading(false)
  }

  if (done) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#00F5FF', fontSize: '14px', letterSpacing: '2px', marginBottom: '8px' }}>// password updated</p>
        <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px' }}>Redirecting to feed...</p>
      </div>
    </main>
  )

  if (!ready) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>verifying reset link...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{
        border: '1px solid rgba(0,245,255,0.3)', padding: '48px',
        width: '100%', maxWidth: '400px', background: '#0e0e1a'
      }}>
        <h1 style={{ color: '#00F5FF', fontSize: '14px', letterSpacing: '2px', marginBottom: '32px', textTransform: 'uppercase' }}>
          // New Password
        </h1>
        <input
          type="password"
          placeholder="new password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="confirm password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
          style={inputStyle}
        />
        <button onClick={handleReset} disabled={loading} style={btnStyle}>
          {loading ? 'updating...' : 'Update Password →'}
        </button>
        {message && (
          <p style={{ color: '#FF2D78', fontSize: '12px', marginTop: '16px' }}>{message}</p>
        )}
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
