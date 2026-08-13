import 'server-only'

function clean(v?: string | null) {
  const s = (v || '').trim()
  return s.length ? s : null
}

/** Turn a raw env value (full URL, domain path, or bare handle) into a usable link. */
function withHttps(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function telegramUrl(v?: string | null) {
  const s = clean(v)
  if (!s) return null
  if (/^(?:https?:\/\/)?(?:www\.)?t\.me\//i.test(s)) return withHttps(s)
  return `https://t.me/${s.replace(/^@/, '')}`
}

function instagramUrl(v?: string | null) {
  const s = clean(v)
  if (!s) return null
  if (/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i.test(s)) return withHttps(s)
  return `https://instagram.com/${s.replace(/^@/, '')}`
}

function discordUrl(v?: string | null) {
  const s = clean(v)
  if (!s) return null
  if (/^(?:https?:\/\/)?(?:www\.)?(?:discord(?:app)?\.com|discord\.gg)\//i.test(s)) {
    return withHttps(s)
  }
  // all digits => a user id, otherwise treat as an invite code
  if (/^\d{15,20}$/.test(s)) return `https://discord.com/users/${s}`
  return `https://discord.gg/${s}`
}

const githubUsername = clean(process.env.GITHUB_USERNAME) || 'Vossgraves'

export const socials = {
  github: {
    username: githubUsername,
    url: `https://github.com/${githubUsername}`,
  },
  youtube: process.env.YOUTUBE_ID
    ? {
        id: process.env.YOUTUBE_ID,
        // supports either a channel id (UC...) or a handle
        url: process.env.YOUTUBE_ID.startsWith('UC')
          ? `https://youtube.com/channel/${process.env.YOUTUBE_ID}`
          : `https://youtube.com/${process.env.YOUTUBE_ID.startsWith('@') ? '' : '@'}${process.env.YOUTUBE_ID}`,
      }
    : null,
  telegram: telegramUrl(process.env.TELEGRAM_URL),
  discord: discordUrl(process.env.DISCORD_URL),
  instagram: instagramUrl(process.env.INSTAGRAM_URL),
}

export const identity = {
  alias: 'Voss Graves',
  // Never exposed publicly — only rendered inside the gated Personal section.
  realName: process.env.REAL_NAME || 'Unknown',
}

export const lastfm = {
  username: process.env.LASTFM_USERNAME || null,
  apiKey: process.env.LASTFM_API_KEY || null,
  get enabled() {
    return Boolean(this.username && this.apiKey)
  },
}

/** GitHub avatar URL derived from the username (no token needed). */
export function githubAvatar(username: string) {
  return `https://github.com/${username}.png`
}
