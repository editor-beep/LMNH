'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Avatar from '../components/Avatar'

export default function Feed() {
 const [drops, setDrops] = useState([])
 const [promoted, setPromoted] = useState([])
 const [trending, setTrending] = useState([])
 const [user, setUser] = useState(null)
 const [loading, setLoading] = useState(true)
 const [tab, setTab] = useState('all')
 const [selectedTag, setSelectedTag] = useState(null)
 const [tags, setTags] = useState([])
 const [tagSearch, setTagSearch] = useState('')
 const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
 const tagRef = useRef(null)

 useEffect(() => {
   supabase.auth.getUser().then(({ data }) => {
     if (data.user) {
       setUser(data.user)
       supabase.rpc('award_login_credits', { p_user_id: data.user.id })
     }
   })
   fetchPromoted()
   fetchTrending()
   fetchTags()
 }, [])

 useEffect(() => {
   fetchDrops()
 }, [tab, selectedTag, user])

 useEffect(() => {
   function handleClickOutside(e) {
     if (tagRef.current && !tagRef.current.contains(e.target)) {
       setTagDropdownOpen(false)
     }
   }
   document.addEventListener('mousedown', handleClickOutside)
   return () => document.removeEventListener('mousedown', handleClickOutside)
 }, [])

 async function fetchTags() {
   const { data } = await supabase.rpc('get_tag_counts')
   setTags(data || [])
 }

 async function fetchDrops() {
   setLoading(true)

   if (tab === 'following' && !user) {
     setDrops([])
     setLoading(false)
     return
   }

   if (tab === 'trending') {
     const { data } = await supabase
       .from('trending_drops')
       .select('*, profiles(username, display_name, avatar_url)')
     setDrops(data || [])
     setLoading(false)
     return
   }

   if (tab === 'following' && user) {
     const { data: followData } = await supabase
       .from('follows')
       .select('following_id')
       .eq('follower_id', user.id)

     const ids = (followData || []).map(f => f.following_id)
     if (ids.length === 0) { setDrops([]); setLoading(false); return }

     let query = supabase
       .from('drops')
       .select('*, profiles(username, display_name, avatar_url)')
       .in('user_id', ids)
       .order('created_at', { ascending: false })

     if (selectedTag) query = query.contains('tags', [selectedTag])
     const { data } = await query
     setDrops(data || [])
     setLoading(false)
     return
   }

   let query = supabase
     .from('drops')
     .select('*, profiles(username, display_name, avatar_url)')
     .order('created_at', { ascending: false })

   if (selectedTag) query = query.contains('tags', [selectedTag])
   const { data, error } = await query
   if (!error) setDrops(data)
   setLoading(false)
 }

 async function fetchPromoted() {
   const { data } = await supabase
     .from('drops')
     .select('*, profiles(username, display_name, avatar_url)')
     .gt('promoted_until', new Date().toISOString())
     .order('promoted_until', { ascending: true })
   setPromoted(data || [])
 }

 async function fetchTrending() {
   const { data } = await supabase
     .from('trending_drops')
     .select('*, profiles(username, display_name, avatar_url)')
   setTrending(data || [])
 }

 async function handleLike(dropId) {
   if (!user) { window.location.href = '/login'; return }
   await supabase.from('likes').insert({ user_id: user.id, drop_id: dropId })
   await supabase.from('drops').update({ like_count: drops.find(d => d.id === dropId)?.like_count + 1 }).eq('id', dropId)
   supabase.rpc('award_credits', {
     p_user_id: user.id,
     p_action_type: 'EARN_LIKE',
     p_amount: 5,
     p_daily_cap: 20,
     p_reference_id: dropId
   })
   fetchDrops()
   fetchTrending()
 }

 async function handleDelete(dropId) {
   if (!window.confirm('Delete this drop? This cannot be undone.')) return
   await supabase.from('comments').delete().eq('drop_id', dropId)
   await supabase.from('likes').delete().eq('drop_id', dropId)
   await supabase.from('drops').delete().eq('id', dropId)
   fetchDrops()
   fetchTrending()
   fetchPromoted()
 }

 const trendingIds = new Set(trending.map(d => d.id))
 const topDrop = trending[0]
 const filteredTags = tags.filter(t =>
   t.tag.toLowerCase().includes(tagSearch.toLowerCase())
 )

 function DropCard({ drop, isPromoted, isMerit }) {
   const isTrending = trendingIds.has(drop.id)
   return (
     <div style={{
       background: isMerit ? '#0a0a14' : isPromoted ? '#0e0e1a' : '#080810',
       padding: '28px 32px',
       transition: 'background 0.15s',
       borderLeft: isMerit ? '2px solid #FF2D78' : isPromoted ? '2px solid #C8FF00' : 'none'
     }}
       onMouseEnter={e => e.currentTarget.style.background = '#0e0e1a'}
       onMouseLeave={e => e.currentTarget.style.background = isMerit ? '#0a0a14' : isPromoted ? '#0e0e1a' : '#080810'}
     >
       {isMerit && (
         <p style={{ color: '#FF2D78', fontSize: '9px', letterSpacing: '3px', marginBottom: '12px' }}>
           ⚡ MOST LIKED · LAST 48 HOURS
         </p>
       )}
       {isPromoted && (
         <p style={{ color: '#C8FF00', fontSize: '9px', letterSpacing: '3px', marginBottom: '12px' }}>
           ★ PROMOTED
         </p>
       )}

       {/* SCREENSHOT */}
       {drop.thumbnail_url && (
         <div style={{ marginBottom: '16px' }}>
           <img
             src={drop.thumbnail_url}
             alt={drop.title}
             style={{
               width: '100%', height: '160px',
               objectFit: 'cover',
               border: '1px solid rgba(255,255,255,0.06)'
             }}
           />
         </div>
       )}

       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
         <Avatar
           url={drop.profiles?.avatar_url}
           username={drop.profiles?.username}
           size={28}
         />
         <Link href={`/builder/${drop.profiles?.username}`} style={{ color: 'rgba(240,238,255,0.5)', fontSize: '11px', letterSpacing: '1px', textDecoration: 'none' }}>
           @{drop.profiles?.username}
         </Link>
         <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', marginLeft: 'auto' }}>
           {new Date(drop.created_at).toLocaleDateString()}
         </span>
       </div>

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
           {isTrending && !isMerit && <span style={{ marginRight: '8px' }}>🔥</span>}
           {drop.title}
         </h2>
       </Link>

       {drop.description && (
         <p style={{ color: 'rgba(240,238,255,0.5)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
           {drop.description.slice(0, 180)}{drop.description.length > 180 ? '...' : ''}
         </p>
       )}

       {drop.tools_used?.length > 0 && (
         <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
           {drop.tools_used.map(tool => (
             <span key={tool} style={{
               fontSize: '10px', padding: '3px 8px',
               border: '1px solid rgba(0,245,255,0.25)',
               color: '#00F5FF', letterSpacing: '1px'
             }}>
               {tool}
             </span>
           ))}
         </div>
       )}

       {drop.tags?.length > 0 && (
         <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
           {drop.tags.map(tag => (
             <span
               key={tag}
               onClick={() => { setSelectedTag(tag); setTab('all'); setTagDropdownOpen(false) }}
               style={{
                 fontSize: '10px', padding: '3px 8px',
                 border: `1px solid ${selectedTag === tag ? 'rgba(155,48,255,0.8)' : 'rgba(155,48,255,0.25)'}`,
                 color: selectedTag === tag ? '#9B30FF' : 'rgba(155,48,255,0.6)',
                 letterSpacing: '1px', cursor: 'pointer'
               }}
             >
               #{tag}
             </span>
           ))}
         </div>
       )}

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
         <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
           <a href={drop.live_url} target="_blank" rel="noopener noreferrer" style={{
             color: '#FF2D78', fontSize: '11px', letterSpacing: '1px', textDecoration: 'none'
           }}>
             visit ↗
           </a>
           {user?.id === drop.user_id && (
             <>
               <Link href={`/drop/${drop.id}/edit`} style={{
                 color: 'rgba(0,245,255,0.5)', fontSize: '11px',
                 letterSpacing: '1px', textDecoration: 'none'
               }}>
                 edit
               </Link>
               <button onClick={() => handleDelete(drop.id)} style={{
                 background: 'none', border: 'none', cursor: 'pointer',
                 color: 'rgba(255,45,120,0.5)', fontSize: '11px',
                 fontFamily: 'monospace', letterSpacing: '1px', padding: 0
               }}>
                 delete
               </button>
             </>
           )}
         </div>
       </div>
     </div>
   )
 }

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

     <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

       {/* FILTER BAR */}
       <div style={{
         display: 'flex', gap: '4px', marginBottom: '40px',
         alignItems: 'center', flexWrap: 'wrap'
       }}>
         {['all', 'following', 'trending'].map(t => (
           <button key={t} onClick={() => { setTab(t); setSelectedTag(null) }} style={{
             background: tab === t && !selectedTag ? 'rgba(0,245,255,0.1)' : 'transparent',
             border: `1px solid ${tab === t && !selectedTag ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
             color: tab === t && !selectedTag ? '#00F5FF' : 'rgba(240,238,255,0.4)',
             padding: '8px 16px', fontFamily: 'monospace', fontSize: '11px',
             cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase'
           }}>
             {t}
           </button>
         ))}

         <div ref={tagRef} style={{ position: 'relative' }}>
           <button
             onClick={() => setTagDropdownOpen(o => !o)}
             style={{
               background: selectedTag ? 'rgba(155,48,255,0.15)' : 'transparent',
               border: `1px solid ${selectedTag ? 'rgba(155,48,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
               color: selectedTag ? '#9B30FF' : 'rgba(240,238,255,0.4)',
               padding: '8px 16px', fontFamily: 'monospace', fontSize: '11px',
               cursor: 'pointer', letterSpacing: '2px'
             }}
           >
             {selectedTag ? `#${selectedTag}` : '# TAGS'} ▾
           </button>

           {tagDropdownOpen && (
             <div style={{
               position: 'absolute', top: '100%', left: 0, marginTop: '4px',
               background: '#0e0e1a', border: '1px solid rgba(155,48,255,0.3)',
               width: '220px', zIndex: 200, maxHeight: '300px', overflowY: 'auto'
             }}>
               <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                 <input
                   autoFocus
                   placeholder="search tags..."
                   value={tagSearch}
                   onChange={e => setTagSearch(e.target.value)}
                   style={{
                     width: '100%', background: 'transparent',
                     border: 'none', outline: 'none',
                     color: '#F0EEFF', fontFamily: 'monospace',
                     fontSize: '12px', boxSizing: 'border-box'
                   }}
                 />
               </div>
               {selectedTag && (
                 <div
                   onClick={() => { setSelectedTag(null); setTagDropdownOpen(false) }}
                   style={{
                     padding: '10px 16px', fontSize: '11px',
                     color: '#FF2D78', cursor: 'pointer',
                     borderBottom: '1px solid rgba(255,255,255,0.06)',
                     letterSpacing: '1px'
                   }}
                 >
                   × clear filter
                 </div>
               )}
               {filteredTags.length === 0 && (
                 <div style={{ padding: '16px', color: 'rgba(240,238,255,0.3)', fontSize: '11px' }}>
                   no tags found
                 </div>
               )}
               {filteredTags.map(t => (
                 <div
                   key={t.tag}
                   onClick={() => { setSelectedTag(t.tag); setTab('all'); setTagDropdownOpen(false); setTagSearch('') }}
                   style={{
                     padding: '10px 16px',
                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                     cursor: 'pointer', fontSize: '12px',
                     color: selectedTag === t.tag ? '#9B30FF' : 'rgba(240,238,255,0.6)',
                     background: selectedTag === t.tag ? 'rgba(155,48,255,0.08)' : 'transparent',
                     borderBottom: '1px solid rgba(255,255,255,0.04)'
                   }}
                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,48,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = selectedTag === t.tag ? 'rgba(155,48,255,0.08)' : 'transparent'}
                 >
                   <span>#{t.tag}</span>
                   <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '10px' }}>{t.count}</span>
                 </div>
               ))}
             </div>
           )}
         </div>

         {selectedTag && (
           <span
             onClick={() => setSelectedTag(null)}
             style={{ color: '#FF2D78', fontSize: '11px', cursor: 'pointer', letterSpacing: '1px' }}
           >
             × clear
           </span>
         )}
       </div>

       {/* MERIT SLOT */}
       {tab === 'all' && !selectedTag && topDrop && (
         <div style={{ marginBottom: '40px' }}>
           <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ color: '#FF2D78', fontSize: '11px', letterSpacing: '3px' }}>// RISING</span>
             <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '10px' }}>most liked · last 48hrs · pure merit</span>
           </div>
           <div style={{ background: 'rgba(255,45,120,0.06)' }}>
             <DropCard drop={topDrop} isPromoted={false} isMerit={true} />
           </div>
         </div>
       )}

       {/* PROMOTED */}
       {tab === 'all' && !selectedTag && promoted.length > 0 && (
         <div style={{ marginBottom: '40px' }}>
           <div style={{ marginBottom: '16px' }}>
             <span style={{ color: '#C8FF00', fontSize: '11px', letterSpacing: '3px' }}>// PROMOTED</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(200,255,0,0.06)' }}>
             {promoted.map(drop => (
               <DropCard key={drop.id} drop={drop} isPromoted={true} isMerit={false} />
             ))}
           </div>
         </div>
       )}

       {/* FEED LABEL */}
       <div style={{ marginBottom: '24px' }}>
         <span style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px' }}>
           {tab === 'following' ? '// FOLLOWING' : tab === 'trending' ? '// TRENDING' : selectedTag ? `// #${selectedTag}` : '// THE FEED'}
         </span>
       </div>

       {loading && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>loading drops...</p>
       )}

       {!loading && drops.length === 0 && tab === 'following' && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>
           not following anyone yet. <Link href="/feed" onClick={() => setTab('all')} style={{ color: '#00F5FF' }}>browse the feed →</Link>
         </p>
       )}

       {!loading && drops.length === 0 && tab === 'trending' && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>
           nothing trending yet. drops need 3+ likes in 48hrs to appear here.
         </p>
       )}

       {!loading && drops.length === 0 && selectedTag && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>
           no drops tagged #{selectedTag} yet.
         </p>
       )}

       {!loading && drops.length === 0 && tab === 'all' && !selectedTag && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>
           no drops yet. <Link href="/new" style={{ color: '#FF2D78' }}>be first →</Link>
         </p>
       )}

       <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: drops.length > 0 ? 'rgba(0,245,255,0.06)' : 'transparent' }}>
         {drops.map(drop => (
           <DropCard key={drop.id} drop={drop} isPromoted={false} isMerit={false} />
         ))}
       </div>
     </div>
   </main>
 )
}
