export default function Avatar({ url, username, size = 32 }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      background: url ? 'transparent' : 'linear-gradient(135deg, #FF2D78, #9B30FF)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size * 0.4}px`,
      color: '#fff',
      fontWeight: 'bold',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {url
        ? <img src={url} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (username || '?')[0].toUpperCase()
      }
    </div>
  )
}
