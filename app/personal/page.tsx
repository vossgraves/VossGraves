import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { ParticleField } from '@/components/particle-field'
import { ClickRipple } from '@/components/click-ripple'
import { StuffILove } from '@/components/stuff-i-love'
import { ProjectsSection } from '@/components/projects/projects-section'
import { PrivateHeader } from '@/components/admin-nav'
import { Toaster } from '@/components/ui/sonner'
import { hasAdminAccess, hasPrivateAccess } from '@/lib/access'
import { getProjects } from '@/app/actions/projects'
import { getSiteContent } from '@/app/actions/site-content'
import { githubAvatar, socials, identity } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function PersonalPage() {
  // Authoritative check: valid, unexpired key in the database.
  if (!(await hasPrivateAccess())) redirect('/')

  const admin = await hasAdminAccess()
  const [content, personalProjects] = await Promise.all([
    getSiteContent(),
    getProjects('personal'),
  ])
  if (!content) redirect('/')

  const avatarUrl = githubAvatar(socials.github.username) || '/placeholder.svg'

  return (
    <>
      <ParticleField />
      <ClickRipple />
      <Toaster position="top-center" theme="dark" />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <PrivateHeader admin={admin} />

        <section className="flex flex-col items-center pt-6 pb-4 text-center">
          <div className="relative mb-5">
            <div className="absolute -inset-1.5 rounded-full bg-foreground/25 blur-md" aria-hidden="true" />
            <img
              src={avatarUrl || '/placeholder.svg'}
              alt={`${identity.realName} avatar`}
              width={96}
              height={96}
              className="relative h-24 w-24 rounded-full border border-border object-cover"
            />
          </div>

          <h1 className="text-balance font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {identity.realName}
          </h1>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>{content.privateTagline}</span>
          </div>

          <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            {content.privateBio}
          </p>
        </section>

        <StuffILove
          title="Private interests"
          sectionId="private-interests"
          items={[
            { title: content.privateLoveOneTitle, body: content.privateLoveOneBody },
            { title: content.privateLoveTwoTitle, body: content.privateLoveTwoBody },
            { title: content.privateLoveThreeTitle, body: content.privateLoveThreeBody },
          ]}
        />

        <ProjectsSection
          title="Personal projects"
          projects={personalProjects}
          visibility="personal"
          admin={false}
        />
      </main>
    </>
  )
}
