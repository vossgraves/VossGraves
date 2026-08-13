import { ContentEditor } from '@/components/content-editor'
import { ProjectsSection } from '@/components/projects/projects-section'
import { getProjects } from '@/app/actions/projects'
import { getSiteContent } from '@/app/actions/site-content'

export const dynamic = 'force-dynamic'

export default async function AdminPersonalPage() {
  const [content, personalProjects] = await Promise.all([
    getSiteContent(),
    getProjects('personal'),
  ])
  if (!content) return null

  return (
    <div className="flex flex-col gap-10">
      <ContentEditor content={content} scope="private" />

      <ProjectsSection
        title="Personal projects"
        projects={personalProjects}
        visibility="personal"
        admin
      />
    </div>
  )
}
