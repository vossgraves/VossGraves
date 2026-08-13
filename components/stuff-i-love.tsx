import { Heart, GitFork, Wand2 } from 'lucide-react'

export type LoveItem = { title: string; body: string }

export function StuffILove({
  items,
  title = 'Stuff I love',
  sectionId = 'about',
  compact = false,
}: {
  items: LoveItem[]
  title?: string
  sectionId?: string
  compact?: boolean
}) {
  const icons = [GitFork, Heart, Wand2]
  return (
    <section id={sectionId} className={compact ? 'py-8' : 'scroll-mt-24 py-14'}>
      <h2 className="mb-6 font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, index) => {
          const Icon = icons[index] ?? Heart
          return (
            <div
              key={`${index}-${item.title}`}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/40"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
