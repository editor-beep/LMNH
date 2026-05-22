'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function DropPage({ params }) {
  const [drop, setDrop] = useState(null)
  const [comments, setComments] = useState([])
  const [user, setUser] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchDrop()
    fetchComments()
  }, [])

  async function fetchDrop() {
    const { data } = await supabase
      .from('drops')
      .select('*, profiles(username, display_name)')
      .eq('id', params.id)
      .single()
    setDrop(data)
    setLoading(false)
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('drop_id', params.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function handleLike() {
    if (!user) { window.location.href = '/login'; return }
    await supabase.from('likes').insert({ user_id: user.id, drop_id: drop.id })
    await supabase.from('drops').update({ like_count: drop.like_count + 1 }).eq('id', drop.id)
    fetchDrop()
  }

  async function handleComment() {
    if (!user) { window.location.href = '/login'; return }
    if (!comment.trim()) return
    setSubmitting(true)

    await supabase.from('comments').insert({
      user_id: user.id,
      drop_id: drop.id,
      body: comment.trim()
    })
    await supabase.from('drops')
      .update({ comment_count: drop.comment_count + 1 })
      .eq('id', drop.id)

    setComment('')
    fetchComments()
    fetchDrop()
    setSubmitting(false)
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(240,238,255,0.3)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px' }}>loading...</p>
    </main>
  )

  if (!drop) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#FF2D78', fontFamily: 'monospace', fontSize: '12px' }}>drop not found.</p>
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
        {user && (
          <Link href="/new" style={{ color: '#FF2D78', fontSize: '11px', letterSpacing: '2px', textDecoration: 'none' }}>
            + DROP
          </Link>
        )}
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

        {/* BUILDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #FF2D78, #9B30FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: '#fff'
          }}>
            {(drop.profiles?.username || '?')[0].toUpperCase()}
          </div>
          <span style={{ color: 'rgba(240,238,255,0.5)', fontSize: '12px', letterSpacing: '1px' }}>
            @{drop.profiles?.username}
          </span>
          <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', marginLeft: 'auto' }}>
            {new Date(drop.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* TITLE */}
        <h1 style={{
          color: '#F0EEFF',
          fontSize: '28px',
          fontFamily: 'monospace',
          fontWeight: 'normal',
          marginBottom: '16px',
          lineHeight: '1.3'
        }}>
          {drop.title}
        </h1>

        {/* DESCRIPTION */}
        {drop.description && (
          <p style={{
            color: 'rgba(240,238,255,0.6)',
            fontSize: '15px',
            lineHeight: '1.7',
            marginBottom: '24px'
          }}>
            {drop.description}
          </p>
        )}

        {/* TOOLS */}
        {drop.tools_used?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {drop.tools_used.map(tool => (
              <span key={tool} style={{
                fontSize: '10px',
                padding: '3px 8px',
                border: '1px solid rgba(0,245,255,0.25)',
                color: '#00F5FF',
                letterSpacing: '1px'
              }}>
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* VISIT BUTTON */}
        <a
          href={drop.live_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#FF2D78',
            color: '#fff',
            padding: '14px 32px',
            fontSize: '12px',
            letterSpacing: '2px',
            textDecoration: 'none',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(255,45,120,0.4)'
          }}
        >
          Visit Drop ↗
        </a>

        {/* VIDEO */}
        {drop.video_url && (
          <div style={{ marginBottom: '32px', marginTop: '8px' }}>
            <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
              // PROCESS VIDEO
            </p>
            <a href={drop.video_url} target="_blank" rel="noopener noreferrer"
              style={{ color: '#00F5FF', fontSize: '13px' }}>
              Watch process video ↗
            </a>
          </div>
        )}

        {/* LIKE */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 0',
          marginBottom: '40px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          <button onClick={handleLike} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(240,238,255,0.5)', fontSize: '13px',
            fontFamily: 'monospace', letterSpacing: '1px', padding: 0
          }}>
            ♥ {drop.like_count || 0} likes
          </button>
          <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '13px' }}>
            ◎ {drop.comment_count || 0} comments
          </span>
        </div>

        {/* COMMENTS */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px' }}>
            // COMMENTS
          </p>

          {comments.length === 0 && (
            <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '12px', marginBottom: '24px' }}>
              no comments yet. be first.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ borderLeft: '2px solid rgba(0,245,255,0.2)', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'center' }}>
                  <span style={{ color: '#00F5FF', fontSize: '11px', letterSpacing: '1px' }}>
                    @{c.profiles?.username}
                  </span>
                  <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '10px' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: 'rgba(240,238,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>

          {/* COMMENT INPUT */}
          {user ? (
            <div>
              <textarea
                placeholder="leave a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: '#0e0e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0EEFF',
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={handleComment}
                disabled={submitting}
                style={{
                  background: '#00F5FF',
                  color: '#080810',
                  border: 'none',
                  padding: '12px 24px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  cursor: 'pointer',
                  letterSpacing: '2px'
                }}
              >
                {submitting ? 'posting...' : 'Post Comment →'}
              </button>
            </div>
          ) : (
            <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>
              <Link href="/login" style={{ color: '#00F5FF' }}>Sign in</Link> to leave a comment.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

