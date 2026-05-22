'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import Avatar from '../../components/Avatar'

export default function BuilderPage({ params }) {
 const [profile, setProfile] = useState(null)
 const [drops, setDrops] = useState([])
 const [user, setUser] = useState(null)
 const [isFollowing, setIsFollowing] = useState(false)
 const [followerCount, setFollowerCount] = useState(0)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
   supabase.auth.getUser().then(({ data }) => setUser(data.user))
   fetchProfile()
 }, [])

 async function fetchProfile() {
   const { data: profileData } = await supabase
     .from('profiles')
     .select('*')
     .eq('username', params.username)
     .single()

   if (!profileData) { setLoading(false); return }
   setProfile(profileData)

   const { data: dropsData } = await supabase
     .from('drops')
     .select('*')
     .eq('user_id', profileData.id)
     .order('created_at', { ascending: false })
   setDrops(dropsData || [])

   const { count } = await supabase
     .from('follows')
     .select('*', { count: 'exact', head: true })
     .eq('following_id', profileData.id)
   setFollowerCount(count || 0)

   setLoading(false)
 }

 useEffect(() => {
   if (!user || !profile) return
   supabase
     .from('follows')
     .select('id')
     .eq('follower_id', user.id)
     .eq('following_id', profile.id)
     .single()
     .then(({ data }) => setIsFollowing(!!data))
 }, [user, profile])

 async function handleFollow() {
   if (!user) { window.location.href = '/login'; return }
   if (isFollowing) {
     await supabase.from('follows')
       .delete()
       .eq('follower_id', user.id)
       .eq('following_id', profile.id)
     setIsFollowing(false)
     setFollowerCount(c => c - 1)
   } else {
     await supabase.from('follows')
       .insert({ follower_id: user.id, following_id: profile.id })
     setIsFollowing(true)
     setFollowerCount(c => c + 1)
     supabase.rpc('award_credits', {
       p_user_id: user.id,
       p_action_type: 'EARN_FOLLOW',
       p_amount: 10,
       p_daily_cap: 5,
       p_reference_id: profile.id
     })
   }
 }

 if (loading) return (
   <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <p style={{ color: 'rgba(240,238,255,0.3)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px' }}>loading...</p>
   </main>
 )

 if (!profile) return (
   <main style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <p style={{ color: '#FF2D78', fontFamily: 'monospace', fontSize: '12px' }}>builder not found.</p>
   </main>
 )

 const isOwnProfile = user?.id === profile.id

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

       <div style={{
         borderBottom: '1px solid rgba(255,255,255,0.06)',
         paddingBottom: '32px',
         marginBottom: '40px'
       }}>
         <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <Avatar
               url={profile.avatar_url}
               username={profile.username}
               size={56}
             />
             <div>
               <h1 style={{ color: '#F0EEFF', fontSize: '20px', fontWeight: 'normal', marginBottom: '4px' }}>
                 {profile.display_name || profile.username}
               </h1>
               <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px', letterSpacing: '1px' }}>
                 @{profile.username}
               </p>
             </div>
           </div>

           {!isOwnProfile && (
             <button
               onClick={handleFollow}
               style={{
                 background: isFollowing ? 'transparent' : '#00F5FF',
                 color: isFollowing ? '#00F5FF' : '#080810',
                 border: '1px solid #00F5FF',
                 padding: '10px 20px',
                 fontFamily: 'monospace',
                 fontSize: '11px',
                 cursor: 'pointer',
                 letterSpacing: '2px'
               }}
             >
               {isFollowing ? 'Following' : 'Follow'}
             </button>
           )}
         </div>

         {profile.bio && (
           <p style={{ color: 'rgba(240,238,255,0.6)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
             {profile.bio}
           </p>
         )}

         {isOwnProfile && (
           <Link href="/settings" style={{
             display: 'inline-block',
             color: 'rgba(240,238,255,0.4)',
             fontSize: '11px',
             letterSpacing: '2px',
             textDecoration: 'none',
             border: '1px solid rgba(255,255,255,0.1)',
             padding: '8px 16px',
             marginBottom: '16px'
           }}>
             Edit Profile
           </Link>
         )}

         <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
           <span style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px' }}>
             <span style={{ color: '#F0EEFF' }}>{drops.length}</span> drops
           </span>
           <span style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px' }}>
             <span style={{ color: '#F0EEFF' }}>{followerCount}</span> followers
           </span>
           <span style={{ color: 'rgba(240,238,255,0.4)', fontSize: '12px' }}>
             <span style={{ color: '#C8FF00' }}>{profile.credits_balance}</span> credits
           </span>
           {profile.website_url && (
             <a href={profile.website_url} target="_blank" rel="noopener noreferrer" style={{
               color: 'rgba(240,238,255,0.4)',
               fontSize: '12px',
               textDecoration: 'none',
               letterSpacing: '1px'
             }}>
               ↗ website
             </a>
           )}
         </div>
       </div>

       <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px' }}>
         // DROPS
       </p>

       {drops.length === 0 && (
         <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px' }}>
           no drops yet.
         </p>
       )}

       <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,245,255,0.06)' }}>
         {drops.map(drop => (
           <div key={drop.id} style={{
             background: '#080810',
             padding: '24px 28px',
             transition: 'background 0.15s'
           }}
             onMouseEnter={e => e.currentTarget.style.background = '#0e0e1a'}
             onMouseLeave={e => e.currentTarget.style.background = '#080810'}
           >
             {drop.thumbnail_url && (
               <div style={{ marginBottom: '12px' }}>
                 <img
                   src={drop.thumbnail_url}
                   alt={drop.title}
                   style={{
                     width: '100%', height: '120px',
                     objectFit: 'cover',
                     border: '1px solid rgba(255,255,255,0.06)'
                   }}
                 />
               </div>
             )}

             <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none' }}>
               <h2 style={{
                 color: '#F0EEFF',
                 fontSize: '16px',
                 fontWeight: 'normal',
                 marginBottom: '10px',
                 lineHeight: '1.4'
               }}>
                 {drop.title}
               </h2>
             </Link>

             {drop.description && (
               <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
                 {drop.description.slice(0, 120)}{drop.description.length > 120 ? '...' : ''}
               </p>
             )}

             {drop.tools_used?.length > 0 && (
               <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                 {drop.tools_used.map(tool => (
                   <span key={tool} style={{
                     fontSize: '10px', padding: '2px 7px',
                     border: '1px solid rgba(0,245,255,0.2)',
                     color: '#00F5FF', letterSpacing: '1px'
                   }}>
                     {tool}
                   </span>
                 ))}
               </div>
             )}

             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
               <span style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px' }}>
                 ♥ {drop.like_count || 0}
               </span>
               <span style={{ color: 'rgba(240,238,255,0.3)', fontSize: '11px' }}>
                 ◎ {drop.comment_count || 0}
               </span>
               <a href={drop.live_url} target="_blank" rel="noopener noreferrer"
                 style={{ color: '#FF2D78', fontSize: '11px', textDecoration: 'none', marginLeft: 'auto' }}>
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
