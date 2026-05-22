'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ display_name: '', bio: '', website_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      fetchProfile(data.user.id)
    })
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data)
      setForm({
        display_name: data.display_name || '',
        bio: data.bio || '',
        website_url: data.website_url || ''
      })
      if (data.avatar_url) setAvatarUrl(data.avatar_url)
    }
    setLoading(false)
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setMessage('')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setMessage(uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    setAvatarUrl(publicUrl)
    setMessage('Avatar updated.')
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')

    let website = form.website_url
    if (website && !website.startsWith('http')) {
      website = 'https://' + website
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        bio: form.bio,
        website_url: website
      })
      .eq('id', user.id)

    if (error) setMessage(error.message)
    else {
      setMessage('Saved.')
      setTimeout(() => window.location.href = `/builder/${profile.username}`, 1000)
    }
    setSaving(false)
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(240,238,255,0.3)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px' }}>loading...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#080810', fontFamily: 'monospace' }}>
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
        <Link href={`/builder/${profile?.username}`} style={{ color: '#00F5FF', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none' }}>
          ← Profile
        </Link>
      </nav>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px' }}>// EDIT PROFILE</p>
        </div>

        {/* AVATAR */}
        <div style={{ marginBottom: '40px' }}>
          <label style={labelStyle}>Profile Picture</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px', height: '72px',
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #FF2D78, #9B30FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', color: '#fff', overflow: 'hidden',
              flexShrink: 0
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (profile?.username || '?')[0].toUpperCase()
              }
            </div>
            <div>
              <label style={{
                display: 'inline-block',
                background: 'transparent',
                color: '#00F5FF',
                border: '1px solid rgba(0,245,255,0.4)',
                padding: '10px 20px',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer',
                letterSpacing: '2px'
              }}>
                {uploading ? 'uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', marginTop: '8px' }}>
                JPG, PNG, GIF — max 2MB
              </p>
            </div>
          </div>
        </div>

        <label style={labelStyle}>Display Name</label>
        <input
          value={form.display_name}
          onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
          placeholder="Your name"
          style={inputStyle}
        />

        <label style={labelStyle}>Bio</label>
        <textarea
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Tell people what you build..."
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <label style={labelStyle}>Website</label>
        <input
          value={form.website_url}
          onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
          placeholder="https://yoursite.com"
          style={inputStyle}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
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
          }}
        >
          {saving ? 'saving...' : 'Save Profile →'}
        </button>

        {message && (
          <p style={{ color: message === 'Saved.' || message === 'Avatar updated.' ? '#C8FF00' : '#FF2D78', fontSize: '12px', marginTop: '16px' }}>
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
