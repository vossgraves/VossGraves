import { lastfm } from '@/lib/config'
import { Music } from 'lucide-react'

type Track = {
  name: string
  artist: { '#text': string }
  image: { '#text': string; size: string }[]
  url: string
  '@attr'?: { nowplaying?: string }
}

async function getRecentTracks(): Promise<Track[]> {
  if (!lastfm.enabled) return []
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
    lastfm.username!,
  )}&api_key=${lastfm.apiKey}&format=json&limit=6`
  try {
    const res = await fetch(url, { next: { revalidate: 120 } })
    if (!res.ok) return []
    const data = await res.json()
    return data?.recenttracks?.track ?? []
  } catch {
    return []
  }
}

export async function LastFm() {
  if (!lastfm.enabled) return null
  const tracks = await getRecentTracks()
  if (tracks.length === 0) return null

  return (
    <section className="py-14">
      <h2 className="mb-6 flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        <Music className="h-4 w-4 text-foreground" />
        Recently played
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((t, i) => {
          const img = t.image?.find((im) => im.size === 'large')?.['#text']
          const nowPlaying = t['@attr']?.nowplaying === 'true'
          return (
            <a
              key={`${t.url}-${i}`}
              href={t.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img || '/placeholder.svg?height=48&width=48&query=album+art'}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.artist['#text']}
                </p>
                {nowPlaying && (
                  <span className="mt-0.5 inline-block text-[10px] font-medium uppercase tracking-wide text-foreground">
                    Now playing
                  </span>
                )}
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
