import { ContentEditor } from '@/components/content-editor'
import { ProjectsSection } from '@/components/projects/projects-section'
import { AmaSection } from '@/components/ama-section'
import { getProjects } from '@/app/actions/projects'
import { getSiteContent } from '@/app/actions/site-content'
import { getAnsweredQuestions, getInboxQuestions } from '@/app/actions/questions'

export const dynamic = 'force-dynamic'

export default async function AdminMainPage() {
  const [content, publicProjects, answered, inbox] = await Promise.all([
    getSiteContent(),
    getProjects('public'),
    getAnsweredQuestions(),
    getInboxQuestions(),
  ])
  if (!content) return null

  return (
    <div className="flex flex-col gap-10">
      <ContentEditor content={content} scope="public" />

      <ProjectsSection
        title="Public projects"
        projects={publicProjects}
        visibility="public"
        admin
      />

      <AmaSection answered={answered} inbox={inbox} admin />
    </div>
  )
}
