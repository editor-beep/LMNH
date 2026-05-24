import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Look Mom No Hands',
  description: 'Built with AI. Shared with pride.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0, background: '#080810' }}>
        {children}
        <footer
          style={{
            borderTop: '1px solid #193355',
            marginTop: 40,
            padding: '20px',
            color: '#9cb3d6',
            textAlign: 'center',
          }}
        >
          <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/cookies">Cookie Policy</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
