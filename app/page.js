'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <h1 style={{
        color: '#FF2D78',
        fontSize: '32px',
        letterSpacing: '2px',
        textShadow: '0 0 30px rgba(255,45,120,0.6)'
      }}>
        LOOK MOM NO HANDS
      </h1>
      <p style={{ color: 'rgba(240,238,255,0.5)', fontSize: '13px', letterSpacing: '3px' }}>
        // room for all
      </p>
      {user ? (
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/new" style={{ color: '#FF2D78', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '2px' }}>
            + New Drop
          </Link>
          <span style={{ color: 'rgba(240,238,255,0.2)' }}>|</span>
          <span
            onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            style={{ color: 'rgba(240,238,255,0.4)', fontFamily: 'monospace', fontSize: '13px', cursor: 'pointer' }}
          >
            Sign Out
          </span>
        </div>
      ) : (
        <Link href="/login" style={{ color: '#00F5FF', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '2px' }}>
          Sign In →
        </Link>
      )}
    </main>
  )
}
