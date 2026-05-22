'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

const TOOLS = [
  'Claude', 'Bolt.new', 'Replit', 'v0', 'Lovable',
  'Cursor', 'Windsurf', 'GitHub Copilot', 'Gemini',
  'ChatGPT', 'Firebase Studio', 'Figma Make', 'Other'
]

export default function NewDrop() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    live_url: '',
    video_url: '',
    tools_used: [],
    tags: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUser(data.user)
    })
  }, [])

  function toggleTool(tool) {
    setForm(f => ({
      ...f,
      tools_used: f.tools_used.includes(tool)
        ? f.tools_used.filter(t => t !== tool)
        : [...f.tools_used, tool]
    }))
  }

  async function handleSubmit() {
    if (!form.title || !form.live_url) {
      setMessage('Title and live URL are required.')
      return
    }
    setLoading(true)
    setMessage('')

    const tags = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const { error } = await supabase.from('drops').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      live_url: form.live_url,
      video_url: form.video_url || null,
      tools_used: form.tools_used,
      tags
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  if (!user) return null

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080810',
      fontFamily: 'monospace',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#00F5FF', fontSize: '14px', letterSpacing: '2px' }}>
            // NEW DROP
          </h1>
          <Link href="/" style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px' }}>
            ← back
          </Link>
        </div>

        <label style={labelStyle}>Title *</label>
        <input
          placeholder="What did you build?"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          style={inputStyle}
        />

        <label style={labelStyle}>Description</label>
        <textarea
          placeholder="Tell us about it..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <label style={labelStyle}>Live URL *</label>
        <input
          placeholder="https://your-thing.vercel.app"
          value={form.live_url}
          onChange={e => setForm(f => ({ ...f, live_url: e.target.value }))}
          style={inputStyle}
        />

        <label style={labelStyle}>Process Video URL <span style={{ opacity: 0.4 }}>(optional)</span></label>
        <input
          placeholder="YouTube or Vimeo link"
          value={form.video_url}
          onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
          style={inputStyle}
        />

        <label style={labelStyle}>Tools Used</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {TOOLS.map(tool => (
            <button
              key={tool}
              onClick={() => toggleTool(tool)}
              style={{
                padding: '8px 14px',
                fontSize: '11px',
                fontFamily: 'monospace',
                border: '1px solid',
                cursor: 'pointer',
                letterSpacing: '1px',
                background: form.tools_used.includes(tool) ? '#00F5FF' : 'transparent',
                color: form.tools_used.includes(tool) ? '#080810' : 'rgba(240,238,255,0.5)',
                borderColor: form.tools_used.includes(tool) ? '#00F5FF' : 'rgba(255,255,255,0.15)',
              }}
            >
              {tool}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Tags <span style={{ opacity: 0.4 }}>(comma separated)</span></label>
        <input
          placeholder="game, puzzle, horror, generative..."
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={btnStyle}
        >
          {loading ? 'dropping...' : 'Drop It →'}
        </button>

        {message && (
          <p style={{ color: '#FF2D78', fontSize: '12px', marginTop: '16px' }}>
            {message}
          </p>
        )}
      </div>
    </main>
  )
}

const labelStyle = {
  display: 'block',
  color: 'rgba(240,238,255,0.5)',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '8px'
}

const inputStyle = {
  width: '100%',
  background: '#0e0e1a',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEFF',
  padding: '12px 16px',
  marginBottom: '24px',
  fontFamily: 'monospace',
  fontSize: '14px',
  outline: 'none',
  display: 'block',
  boxSizing: 'border-box'
}

const btnStyle = {
  width: '100%',
  background: '#FF2D78',
  color: '#fff',
  border: 'none',
  padding: '16px',
  fontFamily: 'monospace',
  fontSize: '13px',
  cursor: 'pointer',
  letterSpacing: '2px',
  marginTop: '8px'
}
