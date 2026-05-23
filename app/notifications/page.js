'use client'
// Requires notifications table in Supabase. Run this SQL:
//
// create table public.notifications (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references public.profiles(id) on delete cascade,
//   type text not null,  -- LIKE | COMMENT | FOLLOW
//   actor_id uuid references public.profiles(id),
//   drop_id uuid references public.drops(id) on delete cascade,
//   read boolean default false,
//   created_at timestamp with time zone default now()
// );
// alter table public.notifications enable row level security;
// create policy "Users can read own notifications" on public.notifications
//   for select using (auth.uid() = user_id);
// create policy "Users can update own notifications" on public.notifications
//   for update using (auth.uid() = user_id);
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Avatar from '../components/Avatar'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      fetchNotifications(data.user.id)
    })
  }, [])

  async function fetchNotifications(userId) {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:profiles!actor_id(username, avatar_url), drop:drops(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
    setLoading(false)
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
  }

  function notifText(type) {
    if (type === 'LIKE') return 'liked your drop'
    if (type === 'COMMENT') return 'commented on your drop'
    if (type === 'FOLLOW') return 'followed you'
    return type
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080810', fontFamily: 'monospace' }}>
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid rgba(0,245,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(8,8,16,0.9)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/feed" style={{ color: '#00F5FF', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none' }}>
          ← LMNH
        </Link>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '32px' }}>
          // NOTIFICATIONS
        </p>

        {loading && (
          <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>loading...</p>
        )}

        {!loading && notifications.length === 0 && (
          <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>no notifications yet.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              background: n.read ? '#080810' : '#0a0a18',
              padding: '16px 20px',
              display: 'flex', gap: '12px', alignItems: 'center',
              borderLeft: n.read ? '3px solid transparent' : '3px solid rgba(0,245,255,0.5)',
            }}>
              <Avatar url={n.actor?.avatar_url} username={n.actor?.username} size={28} />
              <div style={{ flex: 1 }}>
                <Link
                  href={`/builder/${n.actor?.username}`}
                  style={{ color: '#00F5FF', fontSize: '12px', textDecoration: 'none' }}
                >
                  @{n.actor?.username}
                </Link>
                {' '}
                <span style={{ color: 'rgba(240,238,255,0.5)', fontSize: '12px' }}>
                  {notifText(n.type)}
                </span>
                {n.drop && (
                  <span style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px' }}>
                    {' — '}
                    <Link href={`/drop/${n.drop_id}`} style={{ color: 'rgba(240,238,255,0.4)', textDecoration: 'none' }}>
                      {n.drop.title}
                    </Link>
                  </span>
                )}
              </div>
              <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '10px', whiteSpace: 'nowrap' }}>
                {new Date(n.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
