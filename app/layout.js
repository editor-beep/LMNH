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
      <body style={{ margin: 0, padding: 0, background: '#080810' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
