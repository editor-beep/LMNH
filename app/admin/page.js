'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// Set NEXT_PUBLIC_ADMIN_EMAIL in your environment to restrict access.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [recentDrops, setRecentDrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      if (ADMIN_EMAIL && data.user.email !== ADMIN_EMAIL) {
        setLoading(false)
        return
      }
      setAuthorized(true)
      fetchAll()
    })
  }, [])

  async function fetchAll() {
    const [
      { count: userCount },
      { count: dropCount },
      { data: reportsData },
      { data: dropsData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('drops').select('*', { count: 'exact', head: true }),
      supabase
        .from('reports')
        .select('*, reporter:profiles!reporter_id(username), drop:drops(title)')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('drops')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(15),
    ])
    setStats({ userCount: userCount || 0, dropCount: dropCount || 0 })
    setReports(reportsData || [])
    setRecentDrops(dropsData || [])
    setLoading(false)
  }

  async function handleDeleteDrop(dropId) {
    if (!confirm('Delete this drop and all its likes/comments?')) return
    await supabase.from('comments').delete().eq('drop_id', dropId)
    await supabase.from('likes').delete().eq('drop_id', dropId)
    await supabase.from('drops').delete().eq('id', dropId)
    fetchAll()
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>loading...</p>
    </main>
  )

  if (!authorized) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <p style={{ color: '#FF2D78', fontSize: '12px' }}>not authorized.</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#080810', fontFamily: 'monospace' }}>
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid rgba(0,245,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(8,8,16,0.9)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/feed" style={{ color: '#00F5FF', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none' }}>← LMNH</Link>
        <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px' }}>// ADMIN</span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '32px' }}>
          // PLATFORM STATS
        </p>

        {stats && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Users', value: stats.userCount, color: '#00F5FF' },
              { label: 'Total Drops', value: stats.dropCount, color: '#FF2D78' },
              { label: 'Open Reports', value: reports.length, color: '#C8FF00' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '20px 28px', minWidth: '150px' }}>
                <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px' }}>
                  {label.toUpperCase()}
                </p>
                <p style={{ color, fontSize: '28px', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {reports.length > 0 && (
          <>
            <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px' }}>
              // RECENT REPORTS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', marginBottom: '40px' }}>
              {reports.map(r => (
                <div key={r.id} style={{
                  background: '#080810', padding: '16px 20px',
                  display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'
                }}>
                  <span style={{ color: '#FF2D78', fontSize: '11px' }}>@{r.reporter?.username}</span>
                  <span style={{ color: 'rgba(240,238,255,0.4)', fontSize: '11px', flex: 1 }}>
                    reported{r.drop ? ` "${r.drop?.title?.slice(0, 50)}"` : ' a comment'}
                    {r.reason ? ` — ${r.reason}` : ''}
                  </span>
                  {r.drop_id && (
                    <Link href={`/drop/${r.drop_id}`} style={{ color: '#00F5FF', fontSize: '11px', textDecoration: 'none' }}>
                      view
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px' }}>
          // RECENT DROPS
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
          {recentDrops.map(drop => (
            <div key={drop.id} style={{
              background: '#080810', padding: '16px 20px',
              display: 'flex', gap: '16px', alignItems: 'center'
            }}>
              <span style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', minWidth: '100px' }}>
                @{drop.profiles?.username}
              </span>
              <Link href={`/drop/${drop.id}`} style={{ color: '#F0EEFF', fontSize: '13px', textDecoration: 'none', flex: 1 }}>
                {drop.title}
              </Link>
              <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '10px' }}>♥ {drop.like_count || 0}</span>
              <button
                onClick={() => handleDeleteDrop(drop.id)}
                style={{
                  background: 'none', border: '1px solid rgba(255,45,120,0.3)',
                  color: '#FF2D78', padding: '4px 12px',
                  fontFamily: 'monospace', fontSize: '10px',
                  cursor: 'pointer', letterSpacing: '1px',
                }}
              >
                delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
