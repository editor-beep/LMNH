'use client'
// TICKET-003: Requires these SQL functions in Supabase:
//
// create or replace function increment_like(p_drop_id uuid, p_user_id uuid)
// returns void as $$
// begin
//   insert into likes (user_id, drop_id) values (p_user_id, p_drop_id);
//   update drops set like_count = like_count + 1 where id = p_drop_id;
// end;
// $$ language plpgsql security definer;
//
// create or replace function increment_comment_count(p_drop_id uuid)
// returns void as $$
// begin
//   update drops set comment_count = comment_count + 1 where id = p_drop_id;
// end;
// $$ language plpgsql security definer;
//
// TICKET-007: Requires reports table:
//
// create table public.reports (
//   id uuid default gen_random_uuid() primary key,
//   reporter_id uuid references public.profiles(id),
//   drop_id uuid references public.drops(id) on delete cascade,
//   comment_id uuid references public.comments(id) on delete cascade,
//   reason text,
//   created_at timestamp with time zone default now()
// );
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import Avatar from '../../components/Avatar'
import { safeUrl } from '../../../lib/sanitize'

export default function DropPage({ params }) {
  const [drop, setDrop] = useState(null)
  const [comments, setComments] = useState([])
  const [user, setUser] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) checkLiked(data.user.id)
    })
    fetchDrop()
    fetchComments()
  }, [])

  async function checkLiked(userId) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('drop_id', params.id)
      .maybeSingle()
    setHasLiked(!!data)
  }

  async function fetchDrop() {
    const { data } = await supabase
      .from('drops')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('id', params.id)
      .single()
    setDrop(data)
    setLoading(false)
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('drop_id', params.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function handleLike() {
    if (!user) { window.location.href = '/login'; return }
    if (hasLiked) return
    setHasLiked(true)
    const { error } = await supabase.rpc('increment_like', { p_drop_id: drop.id, p_user_id: user.id })
    if (error) {
      // Fallback if RPC not yet created in Supabase
      await supabase.from('likes').insert({ user_id: user.id, drop_id: drop.id })
      await supabase.from('drops').update({ like_count: drop.like_count + 1 }).eq('id', drop.id)
    }
    supabase.rpc('award_credits', {
      p_user_id: user.id,
      p_action_type: 'EARN_LIKE',
      p_amount: 5,
      p_daily_cap: 20,
      p_reference_id: drop.id,
    })
    fetchDrop()
  }

  async function handleDelete() {
    if (!window.confirm('Delete this drop? This cannot be undone.')) return
    await supabase.from('comments').delete().eq('drop_id', drop.id)
    await supabase.from('likes').delete().eq('drop_id', drop.id)
    await supabase.from('drops').delete().eq('id', drop.id)
    window.location.href = '/feed'
  }

  async function handleComment() {
    if (!user) { window.location.href = '/login'; return }
    if (!comment.trim()) return
    setSubmitting(true)

    await supabase.from('comments').insert({
      user_id: user.id,
      drop_id: drop.id,
      body: comment.trim().slice(0, 2000),
    })
    const { error } = await supabase.rpc('increment_comment_count', { p_drop_id: drop.id })
    if (error) {
      await supabase.from('drops')
        .update({ comment_count: drop.comment_count + 1 })
        .eq('id', drop.id)
    }
    supabase.rpc('award_credits', {
      p_user_id: user.id,
      p_action_type: 'EARN_COMMENT',
      p_amount: 20,
      p_daily_cap: 5,
      p_reference_id: drop.id,
    })

    setComment('')
    fetchComments()
    fetchDrop()
    setSubmitting(false)
  }

  async function handleReport() {
    if (!user) { window.location.href = '/login'; return }
    // TICKET-021: RPC handles report insert, count increment, and auto-hide at threshold=3
    await supabase.rpc('submit_report', {
      p_reporter_id: user.id,
      p_drop_id: drop.id,
      p_reason: reportReason.trim().slice(0, 500),
    })
    setShowReport(false)
    setReportReason('')
    setReportSent(true)
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

  const visitUrl = safeUrl(drop.live_url)
  const videoUrl = safeUrl(drop.video_url)

  return (
    <main style={{ minHeight: '100vh', background: '#080810', fontFamily: 'monospace' }}>

      {/* REPORT MODAL */}
      {showReport && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowReport(false) }}
        >
          <div style={{ background: '#0e0e1a', border: '1px solid rgba(255,45,120,0.3)', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <p style={{ color: '#FF2D78', fontSize: '12px', letterSpacing: '2px', marginBottom: '20px' }}>// REPORT DROP</p>
            <textarea
              placeholder="Reason for report (optional)..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={4}
              style={{
                width: '100%', background: '#080810',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F0EEFF', padding: '12px 16px',
                fontFamily: 'monospace', fontSize: '13px',
                outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleReport}
                style={{ background: '#FF2D78', color: '#fff', border: 'none', padding: '10px 20px', fontFamily: 'monospace', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px' }}
              >
                Submit Report →
              </button>
              <button
                onClick={() => setShowReport(false)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,238,255,0.4)', padding: '10px 20px', fontFamily: 'monospace', fontSize: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{
        padding: '16px 32px',
        borderBottom: '1px solid rgba(0,245,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(8,8,16,0.9)', position: 'sticky', top: 0, zIndex: 100,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Avatar url={drop.profiles?.avatar_url} username={drop.profiles?.username} size={32} />
          <Link href={`/builder/${drop.profiles?.username}`} style={{ color: 'rgba(240,238,255,0.5)', fontSize: '12px', letterSpacing: '1px', textDecoration: 'none' }}>
            @{drop.profiles?.username}
          </Link>
          <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', marginLeft: 'auto' }}>
            {new Date(drop.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 style={{ color: '#F0EEFF', fontSize: '28px', fontFamily: 'monospace', fontWeight: 'normal', marginBottom: '16px', lineHeight: '1.3' }}>
          {drop.title}
        </h1>

        {drop.description && (
          <p style={{ color: 'rgba(240,238,255,0.6)', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
            {drop.description}
          </p>
        )}

        {drop.screenshot_urls?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
              // SCREENSHOTS
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {drop.screenshot_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`screenshot ${i + 1}`}
                  style={{
                    width: i === 0 ? '100%' : 'calc(50% - 4px)',
                    height: i === 0 ? '240px' : '120px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {drop.tools_used?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {drop.tools_used.map(tool => (
              <span key={tool} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid rgba(0,245,255,0.25)', color: '#00F5FF', letterSpacing: '1px' }}>
                {tool}
              </span>
            ))}
          </div>
        )}

        {drop.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {drop.tags.map(tag => (
              <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid rgba(155,48,255,0.25)', color: 'rgba(155,48,255,0.6)', letterSpacing: '1px' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {visitUrl && (
          <a
            href={visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', background: '#FF2D78', color: '#fff',
              padding: '14px 32px', fontSize: '12px', letterSpacing: '2px',
              textDecoration: 'none', marginBottom: '16px',
              boxShadow: '0 0 20px rgba(255,45,120,0.4)',
            }}
          >
            Visit Drop ↗
          </a>
        )}

        {videoUrl && (
          <div style={{ marginBottom: '32px', marginTop: '8px' }}>
            <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
              // PROCESS VIDEO
            </p>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00F5FF', fontSize: '13px' }}>
              Watch process video ↗
            </a>
          </div>
        )}

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 0', marginBottom: '40px',
          display: 'flex', gap: '24px', alignItems: 'center',
        }}>
          <button
            onClick={handleLike}
            style={{
              background: 'none', border: 'none',
              cursor: hasLiked ? 'default' : 'pointer',
              color: hasLiked ? '#FF2D78' : 'rgba(240,238,255,0.5)',
              fontSize: '13px', fontFamily: 'monospace', letterSpacing: '1px', padding: 0,
            }}
          >
            {hasLiked ? '♥' : '♡'} {drop.like_count || 0} likes
          </button>
          <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '13px' }}>
            ◎ {drop.comment_count || 0} comments
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
            {user && user.id !== drop.user_id && (
              <>
                {reportSent ? (
                  <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px' }}>reported</span>
                ) : (
                  <button
                    onClick={() => setShowReport(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,255,0.2)', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '1px', padding: 0 }}
                  >
                    report
                  </button>
                )}
              </>
            )}
            {user?.id === drop.user_id && (
              <>
                <Link href={`/drop/${drop.id}/edit`} style={{ color: 'rgba(0,245,255,0.6)', fontSize: '12px', letterSpacing: '1px', textDecoration: 'none' }}>
                  edit
                </Link>
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,45,120,0.6)', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '1px', padding: 0 }}>
                  delete
                </button>
              </>
            )}
          </div>
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
              <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Avatar url={c.profiles?.avatar_url} username={c.profiles?.username} size={28} />
                <div style={{ flex: 1, borderLeft: '2px solid rgba(0,245,255,0.2)', paddingLeft: '16px' }}>
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
              </div>
            ))}
          </div>

          {user ? (
            <div>
              <textarea
                placeholder="leave a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                style={{
                  width: '100%', background: '#0e0e1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0EEFF', padding: '12px 16px',
                  fontFamily: 'monospace', fontSize: '14px',
                  outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box', marginBottom: '12px',
                }}
              />
              <button
                onClick={handleComment}
                disabled={submitting}
                style={{
                  background: '#00F5FF', color: '#080810', border: 'none',
                  padding: '12px 24px', fontFamily: 'monospace',
                  fontSize: '12px', cursor: 'pointer', letterSpacing: '2px',
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
