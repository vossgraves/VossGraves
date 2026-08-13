'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { buttonVariants } from '@/components/ui/button'
import type { Project } from '@/lib/db/schema'
import { Download, FileText, ExternalLink } from 'lucide-react'

function isImage(type?: string | null, url?: string | null) {
  if (type?.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url ?? '')
}

export function PreviewModal({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  if (!project) return null
  const image = isImage(project.fileType, project.fileUrl)
    ? project.fileUrl
    : project.imageUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        {/* Top: image / thumbnail */}
        <div className="flex h-48 items-center justify-center border-b border-border bg-muted/40">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image || '/placeholder.svg'}
              alt={project.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <FileText className="h-16 w-16 text-muted-foreground" />
          )}
        </div>

        {/* Middle: info */}
        <div className="px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-balance">{project.title}</DialogTitle>
            {project.description ? (
              <DialogDescription className="text-pretty leading-relaxed">
                {project.description}
              </DialogDescription>
            ) : (
              <DialogDescription>No description provided.</DialogDescription>
            )}
          </DialogHeader>
          {project.fileName && (
            <p className="mt-3 truncate rounded-md bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
              {project.fileName}
            </p>
          )}
        </div>

        {/* Bottom: download */}
        <div className="flex gap-2 border-t border-border px-6 py-4">
          <a
            href={project.fileUrl ?? '#'}
            download
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ className: 'h-9 flex-1 gap-2' })}
          >
            <Download className="h-4 w-4" />
            Download
          </a>
          <a
            href={project.fileUrl ?? '#'}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ variant: 'outline', className: 'h-9 gap-2 px-3' })}
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
