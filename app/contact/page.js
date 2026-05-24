import NeonBackground from '../components/NeonBackground'

export default function ContactPage() {
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
        <h1>Contact</h1>
        <p>Data Controller: Look Mom No Hands</p>
        <p>Copyright The Means of Production</p>
        <p>Email: info@themeansofproduction.press</p>
        <p>For support or privacy requests, please include your account email and request details.</p>
      </main>
    </>
  )
}
