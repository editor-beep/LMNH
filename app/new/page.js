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
 const [uploading, setUploading] = useState(false)
 const [message, setMessage] = useState('')
 const [screenshots, setScreenshots] = useState([])
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

 async function handleScreenshots(e) {
   const files = Array.from(e.target.files)
   if (!files.length) return
   setUploading(true)

   const uploaded = []
   for (const file of files) {
     const fileExt = file.name.split('.').pop()
     const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

     const { error } = await supabase.storage
       .from('drop-images')
       .upload(filePath, file, { upsert: false })

     if (!error) {
       const { data: urlData } = supabase.storage
         .from('drop-images')
         .getPublicUrl(filePath)
       uploaded.push(urlData.publicUrl)
     }
   }

   setScreenshots(s => [...s, ...uploaded])
   setUploading(false)
 }

 function removeScreenshot(url) {
   setScreenshots(s => s.filter(u => u !== url))
 }

 async function handleSubmit() {
   if (!form.title || !form.live_url) {
     setMessage('Title and live URL are required.')
     return
   }

   // TICKET-019: HTTPS enforcement
   if (!form.live_url.startsWith('https://')) {
     setMessage('Live URL must use HTTPS.')
     return
   }

   setLoading(true)
   setMessage('')

   // TICKET-019: Safe Browsing check (server-side so key stays private)
   const check = await fetch('/api/check-url', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ url: form.live_url })
   })
   const { safe } = await check.json()
   if (!safe) {
     setMessage('This URL was flagged as potentially unsafe and cannot be posted.')
     setLoading(false)
     return
   }

   const tags = form.tags
     .split(',')
     .map(t => t.trim())
     .filter(Boolean)

   // TICKET-020: Mark drops from accounts under 48h as pending
   const accountAge = Date.now() - new Date(user.created_at).getTime()
   const isNewAccount = accountAge < 48 * 60 * 60 * 1000

   const { error } = await supabase.from('drops').insert({
     user_id: user.id,
     title: form.title,
     description: form.description,
     live_url: form.live_url,
     video_url: form.video_url || null,
     tools_used: form.tools_used,
     tags,
     thumbnail_url: screenshots[0] || null,
     screenshot_urls: screenshots,
     pending: isNewAccount
   })

   if (error) {
     setMessage(error.message)
     setLoading(false)
   } else if (isNewAccount) {
     setMessage('Your drop has been submitted and will appear in the feed after a short review. Thanks for joining LMNH.')
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

       {/* SCREENSHOTS */}
       <label style={labelStyle}>Screenshots <span style={{ opacity: 0.4 }}>(optional)</span></label>
       <div style={{ marginBottom: '24px' }}>
         {screenshots.length > 0 && (
           <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
             {screenshots.map((url, i) => (
               <div key={url} style={{ position: 'relative' }}>
                 <img
                   src={url}
                   alt={`screenshot ${i + 1}`}
                   style={{
                     width: '100px', height: '70px',
                     objectFit: 'cover',
                     border: '1px solid rgba(255,255,255,0.1)'
                   }}
                 />
                 {i === 0 && (
                   <span style={{
                     position: 'absolute', bottom: '2px', left: '2px',
                     background: 'rgba(0,0,0,0.7)',
                     color: '#C8FF00', fontSize: '8px', padding: '1px 4px',
                     letterSpacing: '1px'
                   }}>
                     COVER
                   </span>
                 )}
                 <button
                   onClick={() => removeScreenshot(url)}
                   style={{
                     position: 'absolute', top: '2px', right: '2px',
                     background: 'rgba(0,0,0,0.7)', border: 'none',
                     color: '#FF2D78', cursor: 'pointer',
                     fontSize: '10px', padding: '2px 5px',
                     fontFamily: 'monospace'
                   }}
                 >
                   ×
                 </button>
               </div>
             ))}
           </div>
         )}
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
           {uploading ? 'uploading...' : '+ Add Screenshots'}
           <input
             type="file"
             accept="image/*"
             multiple
             onChange={handleScreenshots}
             style={{ display: 'none' }}
           />
         </label>
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', marginTop: '8px' }}>
           First image becomes the cover. JPG, PNG — max 2MB each.
         </p>
       </div>

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
         disabled={loading || uploading}
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
