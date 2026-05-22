'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Feed() {
 const [drops, setDrops] = useState([])
 const [user, setUser] = useState(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
   supabase.auth.getUser().then(({ data }) => {
     if (data.user) {
       setUser(data.user)
       supabase.rpc('award_login_credits', { p_user_id: data.user.id })
     }
   })
   fetchDrops()
 }, [])

 async function fetchDrops() {
   const { data, error } = await supabase
     .from('drops')
     .select(`
       *,
       profiles(username, display_name, avatar_url)
     `)
     .order('created_at', { ascending: false })

   if (!error) setDrops(data)
   setLoading(false)
 }

 async function handleLike(dropId) {
   if (!user) { window.location.href = '/login'; return }
   await supabase.from('likes').insert({ user_id: user.id, drop_id: dropId })
   await supabase.from('drops').update({ like_count: drops.find(d => d.id === dropId).like_count + 1 }).eq('id', dropId)
   supabase.rpc('award_credits', {
     p_user_id: user.id,
     p_action_type: 'EARN_LIKE',
     p_amount: 5,
     p_daily_cap: 20,
     p_reference_id: dropId
   })
   fetchDrops()
 }

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
       <Link href="/" style={{ color: '#00F5FF', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none', textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>
         LMNH
       </Link>
       <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
         {user && (
           <Link href="/new" style={{ color: '#FF2D78', fontSize: '11px', letterSpacing: '2px', textDecoration: 'none' }}>
             + DROP
           </Link>
         )}
         {user && (
           <Link href="/credits" style={{ color: '#C8FF00', fontSize: '11px', letterSpacing: '2px', textDecoration: 'none' }}>
             credits
           </Link>
         )}
         {user
           ? <span onClick={() => supabase.auth.signOut().then(() => window.location.reload())} style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', cursor: 'pointer' }}>sign out</span>
           : <Link href="/login" style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px', textDecoration: 'none' }}>sign in</Link>
         }
       </div>
     </nav>

     {/* FEED */}
     <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

       <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
         <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px' }}>// THE FEED</span>
       </div>

       {loading && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>loading drops...</p>
       )}

       {!loading && drops.length === 0 && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>
           no drops yet. <Link href="/new" style={{ color: '#FF2D78' }}>be first →</Link>
         </p>
       )}

       <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,245,255,0.06)' }}>
         {drops.map(drop => (
           <div key={drop.id} style={{
             background: '#080810',
             padding: '28px 32px',
             transition: 'background 0.15s'
           }}
             onMouseEnter={e => e.currentTarget.style.background = '#0e0e1a'}
             onMouseLeave={e => e.currentTarget.style.background = '#080810'}
           >
             {/* BUILDER */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
               <div style={{
                 width: '28px', height: '28px',
                 background: 'linear-gradient(135deg, #FF2D78, #9B30FF)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: '11px', color: '#fff', fontWeight: 'bold'
               }}>
                 {(drop.profiles?.username || '?')[0].toUpperCase()}
               </div>
               <Link href={`/builder/${drop.profiles?.username}`} style={{ color: 'rgba(240,238,255,0.5)', fontSize: '11px', letterSpacing: '1px', textDecoration: 'none' }}>
                 @{drop.profiles?.username}
               </Link>
               <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', marginLeft: 'auto' }}>
                 {new Date(drop.created_at).toLocaleDateString()}
               </span>
             </div>

             {/* TITLE */}
             <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none' }}>
               <h2 style={{
                 color: '#F0EEFF',
                 fontSize: '18px',
                 fontFamily: 'monospace',
                 fontWeight: 'normal',
                 marginBottom: '10px',
                 letterSpacing: '0.5px',
                 lineHeight: '1.4'
               }}>
                 {drop.title}
               </h2>
             </Link>

             {/* DESCRIPTION */}
             {drop.description && (
               <p style={{ color: 'rgba(240,238,255,0.5)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                 {drop.description.slice(0, 180)}{drop.description.length > 180 ? '...' : ''}
               </p>
             )}

             {/* TOOLS */}
             {drop.tools_used?.length > 0 && (
               <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
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

             {/* ACTIONS */}
             <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '8px' }}>
               <button
                 onClick={() => handleLike(drop.id)}
                 style={{
                   background: 'none', border: 'none', cursor: 'pointer',
                   color: 'rgba(240,238,255,0.4)', fontSize: '11px',
                   fontFamily: 'monospace', letterSpacing: '1px', padding: 0
                 }}
               >
                 ♥ {drop.like_count || 0}
               </button>
               <Link href={`/drop/${drop.id}`} style={{ color: 'rgba(240,238,255,0.4)', fontSize: '11px', letterSpacing: '1px', textDecoration: 'none' }}>
                 ◎ {drop.comment_count || 0} comments
               </Link>
               <a href={drop.live_url} target="_blank" rel="noopener noreferrer" style={{
                 color: '#FF2D78', fontSize: '11px', letterSpacing: '1px',
                 textDecoration: 'none', marginLeft: 'auto'
               }}>
                 visit ↗
               </a>
             </div>
           </div>
         ))}
       </div>
     </div>
   </main>
 )
}
