'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{
        border: '1px solid rgba(0,245,255,0.3)',
        padding: '48px',
        width: '100%',
        maxWidth: '400px',
        background: '#0e0e1a'
      }}>
        <h1 style={{
          color: '#00F5FF',
          fontSize: '14px',
          letterSpacing: '2px',
          marginBottom: '32px',
          textTransform: 'uppercase'
        }}>
          {mode === 'login' ? '// Sign In' : '// Create Account'}
        </h1>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={btnStyle}
        >
          {loading ? 'working...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>

        {message && (
          <p style={{ color: '#FF2D78', fontSize: '12px', marginTop: '16px' }}>
            {message}
          </p>
        )}

        <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px', marginTop: '24px' }}>
          {mode === 'login' ? "No account? " : "Have an account? "}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: '#00F5FF', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  background: '#080810',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEFF',
  padding: '12px 16px',
  marginBottom: '12px',
  fontFamily: 'monospace',
  fontSize: '14px',
  outline: 'none',
  display: 'block'
}

const btnStyle = {
  width: '100%',
  background: '#FF2D78',
  color: '#fff',
  border: 'none',
  padding: '14px',
  fontFamily: 'monospace',
  fontSize: '13px',
  cursor: 'pointer',
  letterSpacing: '1px',
  marginTop: '8px'
}
