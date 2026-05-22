import Link from 'next/link'

export default function About() {
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
        <Link href="/feed" style={{ color: '#00F5FF', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none' }}>
          ← LMNH
        </Link>
        <Link href="/login" style={{ color: '#FF2D78', fontSize: '11px', letterSpacing: '2px', textDecoration: 'none' }}>
          Join →
        </Link>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '80px' }}>
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '4px', marginBottom: '24px' }}>
            // MANIFESTO
          </p>
          <h1 style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(32px, 6vw, 56px)',
            color: '#FF2D78',
            fontWeight: 'normal',
            lineHeight: '1.1',
            letterSpacing: '-1px',
            textShadow: '0 0 40px rgba(255,45,120,0.4)',
            marginBottom: '0'
          }}>
            LOOK MOM<br />NO HANDS
          </h1>
        </div>

        {/* MANIFESTO TEXT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <p style={paraStyle}>
            There are people with things to make who were told the door was for someone else.
          </p>

          <p style={paraStyle}>
            Someone who went to school for it. Someone who already knows the language. Someone with a budget.
          </p>

          <p style={{ ...paraStyle, color: 'rgba(240,238,255,0.35)', fontStyle: 'italic' }}>
            That was always a lie. It was a gate, not a law.
          </p>

          <p style={paraStyle}>
            AI kicked the gate off its hinges. Now anyone can build. A game, a tool, a weird interactive thing that does something no one has done before. You and a chat window and an idea.
          </p>

          <p style={paraStyle}>
            Look Mom No Hands exists for what gets built next.
          </p>

          <p style={paraStyle}>
            We don't care how you got here. We care what you made.
          </p>

          <p style={paraStyle}>
            You can't buy your spotlight on LMNH. You earn it by showing up — watching, following, commenting, being present in a community of people making things that didn't exist before.
          </p>

          {/* ROOM FOR ALL */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 0',
            margin: '16px 0'
          }}>
            <p style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(24px, 4vw, 36px)',
              color: '#C8FF00',
              fontWeight: 'normal',
              lineHeight: '1.3',
              textShadow: '0 0 30px rgba(200,255,0,0.3)',
              margin: 0
            }}>
              Room for all.<br />
              <span style={{ color: 'rgba(240,238,255,0.3)', fontSize: '14px', letterSpacing: '2px' }}>
                That's not a slogan. That's the architecture.
              </span>
            </p>
          </div>

          {/* CREDIT ECONOMY NOTE */}
          <div style={{ borderLeft: '2px solid rgba(0,245,255,0.2)', paddingLeft: '24px' }}>
            <p style={{ ...paraStyle, fontSize: '14px', color: 'rgba(240,238,255,0.4)' }}>
              The credit economy is how we keep it fair. Every like, comment, follow, and video watch earns you credits. Credits buy you visibility in the feed. No real money. No algorithm you can't see. No early adopter advantage that compounds forever.
            </p>
            <p style={{ ...paraStyle, fontSize: '14px', color: 'rgba(240,238,255,0.4)' }}>
              Show up. Earn your spot. Share what you built.
            </p>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/login" style={{
              background: '#FF2D78',
              color: '#fff',
              padding: '16px 32px',
              fontSize: '12px',
              letterSpacing: '2px',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(255,45,120,0.4)',
              fontFamily: 'monospace'
            }}>
              Drop Something →
            </Link>
            <Link href="/feed" style={{
              color: '#00F5FF',
              fontSize: '12px',
              letterSpacing: '2px',
              textDecoration: 'none',
              fontFamily: 'monospace'
            }}>
              See the Feed →
            </Link>
          </div>

          {/* FOOTER NOTE */}
          <p style={{ color: 'rgba(240,238,255,0.2)', fontSize: '11px', letterSpacing: '2px', marginTop: '40px' }}>
            // A platform by The Means of Production
          </p>

        </div>
      </div>
    </main>
  )
}

const paraStyle = {
  color: 'rgba(240,238,255,0.7)',
  fontSize: '17px',
  lineHeight: '1.8',
  fontFamily: 'monospace',
  margin: 0
}

