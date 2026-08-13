'use client'

import { useState } from 'react'
import type { Project } from '@/lib/db/schema'
import { deleteProject } from '@/app/actions/projects'
import { toast } from 'sonner'
import { FileText, Link2, Trash2, Eye, Loader2 } from 'lucide-react'

export function ProjectCard({
  project,
  canDelete,
  onPreview,
}: {
  project: Project
  canDelete: boolean
  onPreview: (p: Project) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const isFile = project.kind === 'file'

  function handleClick() {
    if (isFile) {
      onPreview(project)
    } else if (project.linkUrl) {
      window.open(project.linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setDeleting(true)
    const res = await deleteProject(project.id)
    if (!res.ok) {
      toast.error(res.error)
      setDeleting(false)
    } else {
      toast.success('Deleted')
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/50"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted/30">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl || '/placeholder.svg'}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground">
            {isFile ? <FileText className="h-10 w-10" /> : <Link2 className="h-10 w-10" />}
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {isFile ? <Eye className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
          {isFile ? 'Preview' : 'Link'}
        </span>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete project"
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium">{project.title}</h3>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>
    </div>
  )
}
