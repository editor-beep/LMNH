'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Welcome() {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
    })
  }, [])

  const steps = [
    {
      step: '01',
      title: 'Complete your profile',
      desc: 'Add your display name, bio, and avatar so other builders know who you are.',
      action: { label: 'Go to Settings →', href: '/settings' },
      color: '#00F5FF',
    },
    {
      step: '02',
      title: 'Browse the feed',
      desc: 'See what others are shipping. Like and comment on drops to earn credits.',
      action: { label: 'Browse the Feed →', href: '/feed' },
      color: '#FF2D78',
    },
    {
      step: '03',
      title: 'Post your first drop',
      desc: 'Share something you built with AI. Earn credits when people engage with it.',
      action: { label: 'Post a Drop →', href: '/new' },
      color: '#C8FF00',
    },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#080810', fontFamily: 'monospace', padding: '40px 24px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px', marginTop: '40px' }}>
          <p style={{ color: '#00F5FF', fontSize: '11px', letterSpacing: '4px', marginBottom: '16px' }}>
            // WELCOME TO LMNH
          </p>
          <h1 style={{ color: '#F0EEFF', fontSize: '28px', fontWeight: 'normal', lineHeight: '1.4', marginBottom: '12px' }}>
            Look Mom No Hands.
          </h1>
          <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '14px', lineHeight: '1.6' }}>
            You have <span style={{ color: '#C8FF00' }}>200 credits</span> to start. Here&apos;s how this works.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
          {steps.map(({ step, title, desc, action, color }) => (
            <div key={step} style={{
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 28px',
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
            }}>
              <span style={{ color, fontSize: '24px', fontWeight: 'bold', minWidth: '40px', lineHeight: '1', opacity: 0.8 }}>
                {step}
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#F0EEFF', fontSize: '15px', fontWeight: 'normal', marginBottom: '8px' }}>
                  {title}
                </h2>
                <p style={{ color: 'rgba(240,238,255,0.4)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  {desc}
                </p>
                <Link href={action.href} style={{ color, fontSize: '12px', letterSpacing: '1px', textDecoration: 'none' }}>
                  {action.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px', textAlign: 'center' }}>
          <Link href="/feed" style={{
            display: 'inline-block',
            background: '#FF2D78',
            color: '#fff',
            padding: '14px 40px',
            fontSize: '12px',
            letterSpacing: '2px',
            textDecoration: 'none',
            boxShadow: '0 0 20px rgba(255,45,120,0.3)',
          }}>
            Enter the Feed →
          </Link>
        </div>

      </div>
    </main>
  )
}
