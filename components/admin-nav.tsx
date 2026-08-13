'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock, LogOut, ShieldOff } from 'lucide-react'
import { exitEverything, exitAdminOnly } from '@/app/actions/access'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/main', label: 'Main' },
  { href: '/admin/personal', label: 'Personal' },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2">
      <span className="px-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Admin</span>
      {links.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-colors',
              active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        )
      })}
      <Link
        href="/personal"
        className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        View private
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <form action={exitAdminOnly}>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ShieldOff className="h-4 w-4" />
            Exit admin
          </button>
        </form>
        <form action={exitEverything}>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

export function PrivateHeader({ admin }: { admin: boolean }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2">
      <Link
        href="/"
        className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Home
      </Link>
      {admin && (
        <Link
          href="/admin/main"
          className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Admin
        </Link>
      )}
      <form action={exitEverything} className="ml-auto">
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive">
          <Lock className="h-4 w-4" />
          Lock
        </button>
      </form>
    </div>
  )
}
