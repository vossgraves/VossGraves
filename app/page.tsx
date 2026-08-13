import { ParticleField } from '@/components/particle-field'
import { ClickRipple } from '@/components/click-ripple'
import { TopbarNav } from '@/components/topbar-nav'
import { ClockWidget } from '@/components/clock-widget'
import { Hero } from '@/components/hero'
import { StuffILove } from '@/components/stuff-i-love'
import { LastFm } from '@/components/lastfm'
import { Socials } from '@/components/socials'
import { ProjectsSection } from '@/components/projects/projects-section'
import { AmaSection } from '@/components/ama-section'
import { AccessGate } from '@/components/access-gate'
import { Toaster } from '@/components/ui/sonner'
import { getProjects } from '@/app/actions/projects'
import { getAnsweredQuestions } from '@/app/actions/questions'
import { getSiteContent } from '@/app/actions/site-content'
import { githubAvatar, socials } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [publicProjects, answered, content] = await Promise.all([
    getProjects('public'),
    getAnsweredQuestions(),
    getSiteContent(),
  ])

  if (!content) throw new Error('Site content is missing')

  return (
    <>
      <ParticleField />
      <ClickRipple />
      <TopbarNav />
      <Toaster position="top-center" theme="dark" />
      <AccessGate />
      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <Hero
          avatarUrl={githubAvatar(socials.github.username) || '/placeholder.svg'}
          alias={content.alias}
          tagline={content.tagline}
          bio={content.bio}
        />
        <div className="mx-auto max-w-md">
          <ClockWidget />
        </div>
        <StuffILove
          items={[
            { title: content.loveOneTitle, body: content.loveOneBody },
            { title: content.loveTwoTitle, body: content.loveTwoBody },
            { title: content.loveThreeTitle, body: content.loveThreeBody },
          ]}
        />
        <ProjectsSection
          id="projects"
          title="Projects"
          projects={publicProjects}
          visibility="public"
          admin={false}
        />
        <AmaSection answered={answered} inbox={[]} admin={false} />
        <LastFm />
        <Socials />
      </main>
    </>
  )
}
