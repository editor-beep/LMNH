import NeonBackground from '../components/NeonBackground'

export default function TermsPage() {
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
        <h1>Terms & Conditions</h1>
        <p>By using Look Mom No Hands, you agree to use the service lawfully and responsibly.</p>
        <p>We may suspend accounts that abuse the platform or violate applicable law.</p>
      </main>
    </>
  )
}
