'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Credits() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [drops, setDrops] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [promoting, setPromoting] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      fetchData(data.user.id)
    })
  }, [])

  async function fetchData(userId) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(profileData)

    const { data: dropsData } = await supabase
      .from('drops')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setDrops(dropsData || [])

    const { data: txData } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setTransactions(txData || [])

    setLoading(false)
  }

  async function handlePromote(dropId) {
    setPromoting(dropId)
    setMessage('')
    const { data, error } = await supabase.rpc('promote_drop', {
      p_user_id: user.id,
      p_drop_id: dropId
    })

    if (error) {
      setMessage(error.message)
    } else if (data?.success === false) {
      setMessage(data.error)
    } else {
      setMessage('Drop promoted! It will appear in the rotation shortly.')
      fetchData(user.id)
    }
    setPromoting(null)
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(240,238,255,0.3)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px' }}>loading...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#080810', fontFamily: 'monospace' }}>

      {/* NAV */}
      <nav style={{
        padding: '16px 32px',
        borderBottom: '1px solid rgba(0,245,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(8,8,16,0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link href="/feed" style={{ color: '#00F5FF', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none' }}>
          ← LMNH
        </Link>
        <Link href="/new" style={{ color: '#FF2D78', fontSize: '11px', letterSpacing: '2px', textDecoration: 'none' }}>
          + DROP
        </Link>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

        {/* BALANCE */}
        <div style={{
          border: '1px solid rgba(200,255,0,0.2)',
          padding: '32px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at top left, rgba(200,255,0,0.04) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '11px', letterSpacing: '3px', marginBottom: '12px' }}>
            // YOUR BALANCE
          </p>
          <p style={{ color: '#C8FF00', fontSize: '48px', fontFamily: 'monospace', lineHeight: '1', marginBottom: '8px', textShadow: '0 0 30px rgba(200,255,0,0.4)' }}>
            {profile?.credits_balance || 0}
          </p>
          <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>
            credits
          </p>
        </div>

        {/* HOW TO EARN */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px' }}>
            // EARN CREDITS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,245,255,0.06)' }}>
            {[
              { action: 'Daily login', amount: '+10', cap: '1/day' },
              { action: 'Follow a builder', amount: '+10', cap: '5/day' },
              { action: 'Watch a process video', amount: '+15', cap: '10/day' },
              { action: 'Leave a comment', amount: '+20', cap: '5/day' },
              { action: 'Like a drop', amount: '+5', cap: '20/day' },
            ].map(row => (
              <div key={row.action} style={{
                background: '#080810',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'rgba(240,238,255,0.6)', fontSize: '13px' }}>{row.action}</span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: '#00F5FF', fontSize: '13px', fontFamily: 'monospace' }}>{row.amount}</span>
                  <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px' }}>{row.cap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROMOTE A DROP */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '8px' }}>
            // PROMOTE A DROP
          </p>
          <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', marginBottom: '24px', lineHeight: '1.6' }}>
            500 credits · 24 hours in the rotation · once per drop per 7 days · room for all
          </p>

          {message && (
            <p style={{
              color: message.includes('promoted') ? '#C8FF00' : '#FF2D78',
              fontSize: '12px',
              marginBottom: '20px',
              letterSpacing: '1px'
            }}>
              {message}
            </p>
          )}

          {drops.length === 0 && (
            <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>
              no drops yet. <Link href="/new" style={{ color: '#FF2D78' }}>create one →</Link>
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,45,120,0.06)' }}>
            {drops.map(drop => (
              <div key={drop.id} style={{
                background: '#080810',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F0EEFF', fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {drop.title}
                  </p>
                  {drop.promoted_until && new Date(drop.promoted_until) > new Date() && (
                    <p style={{ color: '#C8FF00', fontSize: '10px', letterSpacing: '1px' }}>
                      ★ PROMOTED until {new Date(drop.promoted_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handlePromote(drop.id)}
                  disabled={promoting === drop.id || (profile?.credits_balance || 0) < 500}
                  style={{
                    background: promoting === drop.id ? 'transparent' : '#FF2D78',
                    color: promoting === drop.id ? '#FF2D78' : '#fff',
                    border: '1px solid #FF2D78',
                    padding: '8px 16px',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    cursor: (profile?.credits_balance || 0) < 500 ? 'not-allowed' : 'pointer',
                    letterSpacing: '1px',
                    opacity: (profile?.credits_balance || 0) < 500 ? 0.4 : 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {promoting === drop.id ? 'promoting...' : '500 credits'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        {transactions.length > 0 && (
          <div>
            <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px' }}>
              // RECENT TRANSACTIONS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,245,255,0.04)' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{
                  background: '#080810',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: 'rgba(240,238,255,0.5)', fontSize: '12px' }}>
                      {tx.type.replace('EARN_', '').replace('SPEND_', '').toLowerCase()}
                    </span>
                    <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '10px', marginLeft: '12px' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{
                    color: tx.amount > 0 ? '#00F5FF' : '#FF2D78',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
