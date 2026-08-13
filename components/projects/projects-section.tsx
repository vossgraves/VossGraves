'use client'

import { useState } from 'react'
import type { Project } from '@/lib/db/schema'
import type { Visibility } from '@/app/actions/projects'
import { ProjectCard } from './project-card'
import { PreviewModal } from './preview-modal'
import { UploadDialog } from './upload-dialog'
import { FolderOpen } from 'lucide-react'

export function ProjectsSection({
  id,
  title,
  projects,
  visibility,
  admin,
  action,
}: {
  id?: string
  title: string
  projects: Project[]
  visibility: Visibility
  /** admin (management password) — can upload and delete */
  admin: boolean
  /** optional trailing control (e.g. a Lock button) */
  action?: React.ReactNode
}) {
  const [preview, setPreview] = useState<Project | null>(null)
  const [open, setOpen] = useState(false)

  function handlePreview(p: Project) {
    setPreview(p)
    setOpen(true)
  }

  return (
    <section id={id} className="scroll-mt-24 py-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {admin && <UploadDialog visibility={visibility} />}
          {action}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
          <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {admin ? 'No projects yet — add your first one.' : 'No projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              canDelete={admin}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      <PreviewModal project={preview} open={open} onOpenChange={setOpen} />
    </section>
  )
}
