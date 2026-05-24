import NeonBackground from '../components/NeonBackground'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <>
      <NeonBackground />
      <main
        style={{
          color: '#dbe4ff',
          maxWidth: 800,
          margin: '0 auto',
          padding: '48px 20px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Link href="/feed" style={{ color: '#00F5FF', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px' }}>
          ← Back to Feed
        </Link>
        <h1>Privacy Policy</h1>
        <p>
          We collect only data required to provide the service, secure accounts, and improve product quality. We do
          not sell personal data.
        </p>
        <p>Questions or requests about your data can be sent through the contact page.</p>
      </main>
    </>
  )
}
