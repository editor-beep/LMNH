import NeonBackground from '../components/NeonBackground'

export default function CookiesPage() {
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
        <h1>Cookie Policy</h1>
        <p>We use essential cookies for authentication and security, and analytics cookies to understand product usage.</p>
        <p>You can manage cookies in your browser settings at any time.</p>
      </main>
    </>
  )
}
