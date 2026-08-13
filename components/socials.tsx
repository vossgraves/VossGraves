import { socials } from '@/lib/config'
import {
  GithubIcon,
  YoutubeIcon,
  InstagramIcon,
  DiscordIcon,
  TelegramIcon,
} from './brand-icons'

export function Socials() {
  const links = [
    { key: 'github', label: 'GitHub', href: socials.github.url, Icon: GithubIcon },
    socials.youtube && {
      key: 'youtube',
      label: 'YouTube',
      href: socials.youtube.url,
      Icon: YoutubeIcon,
    },
    socials.telegram && {
      key: 'telegram',
      label: 'Telegram',
      href: socials.telegram,
      Icon: TelegramIcon,
    },
    socials.discord && {
      key: 'discord',
      label: 'Discord',
      href: socials.discord,
      Icon: DiscordIcon,
    },
    socials.instagram && {
      key: 'instagram',
      label: 'Instagram',
      href: socials.instagram,
      Icon: InstagramIcon,
    },
  ].filter(Boolean) as {
    key: string
    label: string
    href: string
    Icon: React.ComponentType<{ className?: string }>
  }[]

  return (
    <footer className="border-t border-border py-10">
      <h2 className="mb-5 text-center font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Find me
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground"
          >
            <Icon className="h-4 w-4 transition-colors group-hover:text-foreground" />
            <span>{label}</span>
          </a>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        &copy; {new Date().getFullYear()} Voss Graves &middot; vibe coded
      </p>
    </footer>
  )
}
