'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function Home() {
 const canvasRef = useRef(null)

 useEffect(() => {
   const canvas = canvasRef.current
   const ctx = canvas.getContext('2d')
   let W, H, particles = []
   const colors = ['#FF2D78','#00F5FF','#C8FF00','#9B30FF','#FF8C00']

   function resize() {
     W = canvas.width = window.innerWidth
     H = canvas.height = window.innerHeight
   }

   function Particle() {
     this.x = Math.random() * W
     this.y = Math.random() * H
     this.vx = (Math.random() - 0.5) * 0.4
     this.vy = (Math.random() - 0.5) * 0.4
     this.size = Math.random() * 2 + 1
     this.color = colors[Math.floor(Math.random() * colors.length)]
     this.alpha = Math.random() * 0.5 + 0.1
     this.type = Math.random() > 0.7 ? 'diamond' : 'dot'
   }

   function initParticles() {
     particles = []
     for (let i = 0; i < 60; i++) particles.push(new Particle())
   }

   function drawDiamond(x, y, s, color, alpha) {
     ctx.save()
     ctx.globalAlpha = alpha
     ctx.strokeStyle = color
     ctx.lineWidth = 1
     ctx.beginPath()
     ctx.moveTo(x, y - s * 3)
     ctx.lineTo(x + s * 2, y)
     ctx.lineTo(x, y + s * 3)
     ctx.lineTo(x - s * 2, y)
     ctx.closePath()
     ctx.stroke()
     ctx.restore()
   }

   function animate() {
     ctx.clearRect(0, 0, W, H)
     particles.forEach(p => {
       p.x += p.vx
       p.y += p.vy
       if (p.x < 0) p.x = W
       if (p.x > W) p.x = 0
       if (p.y < 0) p.y = H
       if (p.y > H) p.y = 0
       if (p.type === 'diamond') {
         drawDiamond(p.x, p.y, p.size, p.color, p.alpha)
       } else {
         ctx.save()
         ctx.globalAlpha = p.alpha
         ctx.fillStyle = p.color
         ctx.beginPath()
         ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
         ctx.fill()
         ctx.restore()
       }
     })
     requestAnimationFrame(animate)
   }

   resize()
   initParticles()
   animate()
   window.addEventListener('resize', () => { resize(); initParticles() })

   const reveals = document.querySelectorAll('.reveal')
   const obs = new IntersectionObserver((entries) => {
     entries.forEach((e, i) => {
       if (e.isIntersecting) {
         setTimeout(() => e.target.classList.add('visible'), i * 100)
         obs.unobserve(e.target)
       }
     })
   }, { threshold: 0.1 })
   reveals.forEach(el => obs.observe(el))

   return () => window.removeEventListener('resize', resize)
 }, [])

 return (
   <>
     <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
       :root {
         --bg: #080810; --bg2: #0e0e1a;
         --pink: #FF2D78; --cyan: #00F5FF;
         --lime: #C8FF00; --purple: #9B30FF;
         --white: #F0EEFF; --dim: rgba(240,238,255,0.5);
         --grid: rgba(0,245,255,0.04);
       }
       * { margin: 0; padding: 0; box-sizing: border-box; }
       html { scroll-behavior: smooth; }
       body {
         background: var(--bg); color: var(--white);
         font-family: 'Share Tech Mono', monospace;
         overflow-x: hidden;
       }
       body::after {
         content: ''; position: fixed; inset: 0;
         background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
         pointer-events: none; z-index: 9998;
       }
       .grid-bg {
         position: fixed; inset: 0;
         background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
         background-size: 40px 40px; pointer-events: none; z-index: 0;
       }
       #particles { position: fixed; inset: 0; pointer-events: none; z-index: 1; }
       nav {
         position: sticky; top: 0; z-index: 100;
         display: flex; justify-content: space-between; align-items: center;
         padding: 16px 40px; background: rgba(8,8,16,0.85);
         backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,245,255,0.15);
       }
       .nav-logo {
         font-family: 'Press Start 2P', monospace; font-size: 13px;
         color: var(--cyan); text-decoration: none;
         text-shadow: 0 0 20px var(--cyan), 0 0 40px rgba(0,245,255,0.4);
       }
       .nav-logo .accent { color: var(--pink); }
       .nav-links { display: flex; gap: 12px; align-items: center; }
       .btn {
         font-family: 'Press Start 2P', monospace; font-size: 9px;
         padding: 12px 20px; text-decoration: none; cursor: pointer;
         letter-spacing: 1px; transition: all 0.15s; border: none; display: inline-block;
       }
       .btn-ghost {
         background: transparent; color: var(--cyan);
         border: 1px solid rgba(0,245,255,0.4);
       }
       .btn-ghost:hover {
         background: rgba(0,245,255,0.08); border-color: var(--cyan);
         box-shadow: 0 0 16px rgba(0,245,255,0.3);
       }
       .btn-primary { background: var(--pink); color: #fff; box-shadow: 0 0 20px rgba(255,45,120,0.5); }
       .btn-primary:hover { background: #ff5296; box-shadow: 0 0 32px rgba(255,45,120,0.8); transform: translateY(-2px); }
       .btn-big { font-size: 11px; padding: 18px 32px; }
       @keyframes glitchIn {
         0% { opacity: 0; transform: translateX(-20px) skewX(-5deg); }
         60% { transform: translateX(4px) skewX(1deg); opacity: 1; }
         100% { transform: translateX(0) skewX(0); }
       }
       @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
       .drop-card {
         background: var(--bg2); border: 1px solid rgba(0,245,255,0.15);
         overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; cursor: pointer;
       }
       .drop-card:hover { border-color: var(--cyan); box-shadow: 0 0 24px rgba(0,245,255,0.15); transform: translateY(-3px); }
       .drop-card:nth-child(2):hover { border-color: var(--pink); box-shadow: 0 0 24px rgba(255,45,120,0.15); }
       .drop-card:nth-child(3):hover { border-color: var(--lime); box-shadow: 0 0 24px rgba(200,255,0,0.15); }
       .drop-thumb {
         height: 90px; display: flex; align-items: center; justify-content: center;
         border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden;
       }
       .drop-thumb-1 { background: radial-gradient(ellipse at 30% 50%, rgba(255,45,120,0.3) 0%, rgba(155,48,255,0.2) 50%, transparent 100%); }
       .drop-thumb-2 { background: radial-gradient(ellipse at 70% 50%, rgba(0,245,255,0.3) 0%, rgba(26,26,255,0.2) 50%, transparent 100%); }
       .drop-thumb-3 { background: radial-gradient(ellipse at 50% 50%, rgba(200,255,0,0.2) 0%, rgba(0,200,83,0.15) 50%, transparent 100%); }
       .pixel-art { display: grid; gap: 2px; opacity: 0.7; }
       .px { width: 7px; height: 7px; }
       .drop-info { padding: 14px 16px; }
       .drop-title { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--white); }
       .drop-meta { display: flex; align-items: center; justify-content: space-between; }
       .drop-builder { font-size: 11px; color: var(--dim); }
       .drop-tools { display: flex; gap: 6px; }
       .tool-pill { font-family: 'Share Tech Mono', monospace; font-size: 10px; padding: 3px 8px; border: 1px solid; }
       .tp-pink { border-color: var(--pink); color: var(--pink); }
       .tp-cyan { border-color: var(--cyan); color: var(--cyan); }
       .tp-lime { border-color: var(--lime); color: var(--lime); }
       .tp-purp { border-color: var(--purple); color: var(--purple); }
       .ticker {
         position: relative; z-index: 2; background: var(--bg);
         border-top: 1px solid rgba(255,45,120,0.3); border-bottom: 1px solid rgba(255,45,120,0.3);
         padding: 12px 0; overflow: hidden;
       }
       .ticker-track { display: flex; animation: ticker 22s linear infinite; white-space: nowrap; }
       .ticker-track span { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: var(--pink); letter-spacing: 3px; text-transform: uppercase; padding: 0 32px; }
       .ticker-track .sep { color: var(--cyan); padding: 0 4px; }
       @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
       section.content { position: relative; z-index: 2; padding: 100px 60px; }
       .section-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--cyan); letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
       .section-label::before { content: '//'; opacity: 0.4; }
       .section-title { font-family: 'Press Start 2P', monospace; font-size: clamp(22px, 3vw, 36px); line-height: 1.4; margin-bottom: 60px; }
       .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.08); }
       .step { background: var(--bg); padding: 40px 28px; transition: background 0.2s; position: relative; overflow: hidden; }
       .step::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; transition: opacity 0.2s; opacity: 0; }
       .step:nth-child(1)::before { background: var(--pink); }
       .step:nth-child(2)::before { background: var(--cyan); }
       .step:nth-child(3)::before { background: var(--lime); }
       .step:nth-child(4)::before { background: var(--purple); }
       .step:hover { background: var(--bg2); }
       .step:hover::before { opacity: 1; }
       .step-num { font-family: 'Press Start 2P', monospace; font-size: 10px; margin-bottom: 20px; display: block; }
       .step:nth-child(1) .step-num { color: var(--pink); }
       .step:nth-child(2) .step-num { color: var(--cyan); }
       .step:nth-child(3) .step-num { color: var(--lime); }
       .step:nth-child(4) .step-num { color: var(--purple); }
       .step-icon { font-size: 36px; margin-bottom: 20px; display: block; }
       .step-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 2px; }
       .step-desc { font-family: 'Rajdhani', sans-serif; font-size: 15px; line-height: 1.65; color: var(--dim); }
       .economy-section { position: relative; z-index: 2; padding: 100px 60px; background: var(--bg2); border-top: 1px solid rgba(0,245,255,0.08); border-bottom: 1px solid rgba(0,245,255,0.08); }
       .credits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 48px; }
       .credit-block { border: 1px solid rgba(255,255,255,0.08); padding: 36px; position: relative; overflow: hidden; }
       .credit-block::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(ellipse at top left, rgba(0,245,255,0.04) 0%, transparent 70%); pointer-events: none; }
       .credit-block.spend::after { background: radial-gradient(ellipse at top left, rgba(255,45,120,0.05) 0%, transparent 70%); }
       .credit-block-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
       .credit-block-title { font-family: 'Press Start 2P', monospace; font-size: 13px; }
       .earn .credit-block-title { color: var(--cyan); }
       .spend .credit-block-title { color: var(--pink); }
       .credit-rows { display: flex; flex-direction: column; }
       .credit-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'Rajdhani', sans-serif; font-size: 16px; }
       .credit-row:last-child { border-bottom: none; }
       .credit-amount { font-family: 'Share Tech Mono', monospace; font-size: 13px; }
       .plus { color: var(--cyan); } .minus { color: var(--pink); } .gold { color: var(--lime); } .good { color: var(--lime); }
       .manifesto-box { margin-top: 48px; padding: 48px; border: 1px solid rgba(200,255,0,0.2); text-align: center; position: relative; overflow: hidden; }
       .manifesto-box::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(200,255,0,0.04) 0%, transparent 70%); }
       .manifesto-text { font-family: 'Press Start 2P', monospace; font-size: clamp(14px, 2vw, 20px); color: var(--lime); line-height: 1.8; text-shadow: 0 0 30px rgba(200,255,0,0.4); position: relative; }
       .manifesto-byline { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--dim); margin-top: 20px; letter-spacing: 3px; text-transform: uppercase; position: relative; }
       .tools-section { position: relative; z-index: 2; padding: 100px 60px; }
       .tools-wrap { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 48px; }
       .tool-badge { font-family: 'Share Tech Mono', monospace; font-size: 12px; padding: 10px 20px; border: 1px solid rgba(255,255,255,0.12); color: var(--dim); cursor: default; transition: all 0.15s; letter-spacing: 1px; }
       .tool-badge:hover { border-color: var(--cyan); color: var(--cyan); box-shadow: 0 0 14px rgba(0,245,255,0.2); }
       .tool-badge.hot { border-color: rgba(255,45,120,0.4); color: var(--pink); }
       .cta-section { position: relative; z-index: 2; padding: 120px 60px; text-align: center; overflow: hidden; }
       .cta-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
       .cta-title { font-family: 'Press Start 2P', monospace; font-size: clamp(24px, 4vw, 48px); line-height: 1.4; margin-bottom: 24px; position: relative; }
       .cta-title .pink { color: var(--pink); text-shadow: 0 0 30px rgba(255,45,120,0.6); }
       .cta-sub { font-family: 'Rajdhani', sans-serif; font-size: 20px; color: var(--dim); max-width: 520px; margin: 0 auto 48px; line-height: 1.6; position: relative; }
       .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
       .bonus-badge { display: inline-block; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--lime); border: 1px solid rgba(200,255,0,0.3); padding: 8px 16px; margin-top: 24px; letter-spacing: 2px; }
       footer { position: relative; z-index: 2; background: var(--bg); border-top: 1px solid rgba(0,245,255,0.1); padding: 48px 60px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
       .footer-logo { font-family: 'Press Start 2P', monospace; font-size: 11px; color: var(--cyan); text-shadow: 0 0 20px rgba(0,245,255,0.4); }
       .footer-logo .pink { color: var(--pink); }
       .footer-manifesto { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: var(--lime); letter-spacing: 3px; }
       .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--dim); line-height: 1.8; text-align: right; }
       .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
       .reveal.visible { opacity: 1; transform: translateY(0); }
       @media (max-width: 960px) {
         .steps-grid { grid-template-columns: 1fr 1fr; }
         .credits-grid { grid-template-columns: 1fr; }
         section.content, .economy-section, .tools-section, .cta-section { padding: 60px 24px; }
         footer { padding: 32px 24px; flex-direction: column; text-align: center; }
         .footer-copy { text-align: center; }
         nav { padding: 14px 20px; }
       }
       @media (max-width: 600px) {
         .steps-grid { grid-template-columns: 1fr; }
         .btn-ghost { display: none; }
       }
     `}</style>

     <div className="grid-bg" />
     <canvas id="particles" ref={canvasRef} />

     <nav>
       <Link href="/" className="nav-logo">LMNH <span className="accent">↗</span></Link>
       <div className="nav-links">
         <Link href="/feed" className="btn btn-primary btn-big" style={{fontSize:'10px', padding:'14px 28px'}}>
           Browse the Feed →
         </Link>
         <Link href="/login" className="btn btn-ghost">Sign Up</Link>
       </div>
     </nav>

     <section style={{
       position: 'relative',
       zIndex: 2,
       display: 'flex',
       flexDirection: 'column',
       alignItems: 'center',
       padding: '60px 40px 80px',
       textAlign: 'center'
     }}>
       {/* HERO IMAGE */}
       <div style={{
         width: '100%',
         maxWidth: '900px',
         marginBottom: '48px',
         animation: 'fadeUp 0.8s ease-out both'
       }}>
         <img
           src="/hero.PNG"
           alt="Look Mom No Hands"
           style={{
             width: '100%',
             height: 'auto',
             filter: 'drop-shadow(0 0 60px rgba(0,245,255,0.2))'
           }}
         />
       </div>

       {/* TITLE */}
       <h1 style={{
         fontFamily: "'Press Start 2P', monospace",
         fontSize: 'clamp(24px, 5vw, 56px)',
         lineHeight: 1.3,
         marginBottom: '24px',
         animation: 'glitchIn 0.8s ease-out 0.2s both'
       }}>
         <span style={{color: '#F0EEFF', display: 'block'}}>LOOK MOM</span>
         <span style={{color: '#F0EEFF', display: 'block'}}>NO</span>
         <span style={{
           color: '#FF2D78',
           display: 'block',
           textShadow: '0 0 30px #FF2D78, 0 0 60px rgba(255,45,120,0.4)',
           position: 'relative'
         }}>
           HANDS
           <span style={{
             position: 'absolute',
             left: '3px',
             top: '3px',
             color: '#00F5FF',
             opacity: 0.4,
             clipPath: 'inset(30% 0 40% 0)',
             pointerEvents: 'none'
           }}>HANDS</span>
         </span>
       </h1>

       {/* SUB */}
       <p style={{
         fontFamily: "'Rajdhani', sans-serif",
         fontSize: 'clamp(18px, 2.5vw, 24px)',
         lineHeight: 1.6,
         color: 'rgba(240,238,255,0.6)',
         maxWidth: '600px',
         marginBottom: '48px',
         animation: 'fadeUp 0.6s ease-out 0.4s both'
       }}>
         You built something <strong style={{color: '#F0EEFF'}}>wild with AI.</strong> Now it has a home.<br/>
         No gatekeepers. No algorithms you can't see.<br/>
         <strong style={{color: '#F0EEFF'}}>Post your work. Engage with others. Earn your spotlight.</strong>
       </p>

       {/* CTAS */}
       <div style={{
         display: 'flex',
         gap: '16px',
         flexWrap: 'wrap',
         justifyContent: 'center',
         marginBottom: '48px',
         animation: 'fadeUp 0.6s ease-out 0.6s both'
       }}>
         <Link href="/login" className="btn btn-primary btn-big">Drop Something →</Link>
         <Link href="/feed" className="btn btn-ghost btn-big">Browse the Feed</Link>
       </div>

       {/* MANIFESTO */}
       <div style={{
         fontFamily: "'Share Tech Mono', monospace",
         fontSize: '13px',
         color: '#C8FF00',
         letterSpacing: '3px',
         textTransform: 'uppercase',
         animation: 'fadeUp 0.6s ease-out 0.8s both'
       }}>
         // Room for all.
       </div>
     </section>

     <div className="ticker">
       <div className="ticker-track">
         {['BUILD IT','DROP IT','SHARE IT','EARN IT','ROOM FOR ALL','NO CODE REQUIRED','LOOK MOM NO HANDS',
           'BUILD IT','DROP IT','SHARE IT','EARN IT','ROOM FOR ALL','NO CODE REQUIRED','LOOK MOM NO HANDS'].map((t, i) => (
           <span key={i}>{t}</span>
         ))}
       </div>
     </div>

     <section className="content" id="how">
       <div className="reveal">
         <div className="section-label">01</div>
         <h2 className="section-title">How It Works</h2>
       </div>
       <div className="steps-grid reveal">
         {[
           { num: '01', icon: '🔨', title: 'Build Something', desc: "Use Claude, Bolt, Replit, v0 — whatever. Make a game, a site, a weird interactive thing. Doesn't have to be good. Has to be yours.", color: 'var(--pink)' },
           { num: '02', icon: '📡', title: 'Drop It', desc: 'Post your Drop: link to the live thing, describe it, tag your tools. Add a process video if you want. Show your work.', color: 'var(--cyan)' },
           { num: '03', icon: '👁', title: 'Participate', desc: 'Follow builders. Watch videos. Leave real comments. Every action earns credits — a closed-loop economy that keeps the community alive.', color: 'var(--lime)' },
           { num: '04', icon: '⚡', title: 'Earn Your Spotlight', desc: 'Spend credits to promote your Drop in the feed rotation. Everyone gets a fair shot. No ads. No credit cards. Room for all.', color: 'var(--purple)' },
         ].map(s => (
           <div key={s.num} className="step">
             <span className="step-num" style={{color: s.color}}>{s.num}</span>
             <span className="step-icon">{s.icon}</span>
             <div className="step-title">{s.title}</div>
             <p className="step-desc">{s.desc}</p>
           </div>
         ))}
       </div>
     </section>

     <section className="economy-section" id="credits">
       <div className="reveal">
         <div className="section-label">02</div>
         <h2 className="section-title">The Credit Economy</h2>
       </div>
       <p className="reveal" style={{fontFamily:'Rajdhani,sans-serif', fontSize:'18px', maxWidth:'600px', lineHeight:'1.7', color:'var(--dim)'}}>
         No real money. Ever. You earn credits by being a good citizen. You spend them to promote your work. The more you participate, the more visible you become.
       </p>
       <div className="credits-grid">
         <div className="credit-block earn reveal">
           <div className="credit-block-header"><div className="credit-block-title">EARN</div></div>
           <div className="credit-rows">
             {[['Daily login','+10 / day'],['Follow a builder','+10 each (cap 5/day)'],['Watch a process video','+15 each (cap 10/day)'],['Leave a comment','+20 each (cap 5/day)'],['Like a Drop','+5 each (cap 20/day)'],['Max per day','410 credits']].map(([a,b]) => (
               <div key={a} className="credit-row"><span>{a}</span><span className="credit-amount plus">{b}</span></div>
             ))}
           </div>
         </div>
         <div className="credit-block spend reveal">
           <div className="credit-block-header"><div className="credit-block-title">SPEND</div></div>
           <div className="credit-rows">
             {[['Promote a Drop (24hrs)','500 credits'],['Per Drop limit','Once per 7 days'],['Promoted slots in feed','6 at a time'],['Queue system','Fair rotation'],['Credits expire?','Never.'],['New builder bonus','+200 on signup']].map(([a,b],i) => (
               <div key={a} className="credit-row"><span>{a}</span><span className={`credit-amount ${i < 2 ? 'minus' : i < 4 ? 'gold' : 'good'}`}>{b}</span></div>
             ))}
           </div>
         </div>
       </div>
       <div className="manifesto-box reveal">
         <div className="manifesto-text">"You wait your turn like everyone else.<br/>That's not a bug. That's the whole point."</div>
         <div className="manifesto-byline">// The LMNH Promotion Manifesto</div>
       </div>
     </section>

     <section className="tools-section" id="tools">
       <div className="reveal">
         <div className="section-label">03</div>
         <h2 className="section-title">Built With Anything</h2>
       </div>
       <p className="reveal" style={{fontFamily:'Rajdhani,sans-serif', fontSize:'18px', maxWidth:'560px', color:'var(--dim)', lineHeight:'1.7'}}>
         LMNH doesn't care what you used. Tag your tools, find your people, filter the whole feed by stack.
       </p>
       <div className="tools-wrap reveal">
         {[['Claude',true],['Bolt.new',false],['Replit',true],['v0 by Vercel',false],['Lovable',false],['Cursor',false],['Windsurf',false],['GitHub Copilot',true],['Gemini',false],['ChatGPT',false],['Firebase Studio',false],['Figma Make',false],['Emergent',false],['+ anything else',false]].map(([t,h]) => (
           <span key={t} className={`tool-badge${h ? ' hot' : ''}`}>{t}</span>
         ))}
       </div>
     </section>

     <section className="cta-section" id="join">
       <div className="cta-glow" />
       <h2 className="cta-title reveal">READY TO<br/><span className="pink">DROP?</span></h2>
       <p className="cta-sub reveal">Sign up free. Get 200 bonus credits. Be one of the first builders in the feed.</p>
       <div className="cta-actions reveal">
         <Link href="/login" className="btn btn-primary btn-big">Create Account →</Link>
         <Link href="/feed" className="btn btn-ghost btn-big">Browse the Feed</Link>
       </div>
       <div className="reveal" style={{marginTop:'24px'}}>
         <span className="bonus-badge">▶ 200 CREDITS FREE ON SIGNUP</span>
       </div>
     </section>

     <footer>
       <div className="footer-logo">LOOK MOM <span className="pink">NO HANDS</span></div>
       <div className="footer-manifesto">// Room for all.</div>
       <div className="footer-copy">
         A platform by The Means of Production<br/>
         No VC. No ads. No gatekeeping.<br/>
         © 2026 LMNH
       </div>
     </footer>
   </>
 )
}
