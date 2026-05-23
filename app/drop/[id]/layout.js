export async function generateMetadata({ params }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { title: 'LMNH' }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(url, key)
    const { data: drop } = await client
      .from('drops')
      .select('title, description, thumbnail_url')
      .eq('id', params.id)
      .single()

    if (!drop) return { title: 'LMNH' }

    const title = `${drop.title} — LMNH`
    const description = drop.description || 'Built with AI. Shared with pride.'

    return {
      title,
      description,
      openGraph: {
        title: drop.title,
        description,
        images: drop.thumbnail_url ? [{ url: drop.thumbnail_url }] : [],
        siteName: 'Look Mom No Hands',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: drop.title,
        description,
        images: drop.thumbnail_url ? [drop.thumbnail_url] : [],
      },
    }
  } catch {
    return { title: 'LMNH' }
  }
}

export default function DropLayout({ children }) {
  return children
}
