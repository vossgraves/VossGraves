'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createProject, type Visibility } from '@/app/actions/projects'
import { toast } from 'sonner'
import { Link2, FileUp, ImageIcon, Loader2, Plus } from 'lucide-react'

async function uploadToCatbox(file: File): Promise<{ url: string; name: string; type: string }> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}

export function UploadDialog({ visibility }: { visibility: Visibility }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<'link' | 'file'>('link')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setKind('link')
    setTitle('')
    setDescription('')
    setLinkUrl('')
    setImageFile(null)
    setProjectFile(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (kind === 'link' && !linkUrl.trim()) {
      toast.error('Add a project link')
      return
    }
    if (kind === 'file' && !projectFile) {
      toast.error('Choose a file to upload')
      return
    }

    setSubmitting(true)
    try {
      let imageUrl: string | undefined
      let fileUrl: string | undefined
      let fileName: string | undefined
      let fileType: string | undefined

      if (imageFile) {
        const up = await uploadToCatbox(imageFile)
        imageUrl = up.url
      }
      if (kind === 'file' && projectFile) {
        const up = await uploadToCatbox(projectFile)
        fileUrl = up.url
        fileName = up.name
        fileType = up.type || projectFile.type
      }

      const result = await createProject({
        title,
        description,
        visibility,
        kind,
        imageUrl,
        linkUrl: kind === 'link' ? linkUrl.trim() : undefined,
        fileUrl,
        fileName,
        fileType,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Project added')
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add project
      </Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a project</DialogTitle>
          <DialogDescription>
            Upload a link or a file. Files are hosted on catbox.moe and previewable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind('link')}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors ${
                kind === 'link'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <Link2 className="h-4 w-4" /> Link
            </button>
            <button
              type="button"
              onClick={() => setKind('file')}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors ${
                kind === 'file'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <FileUp className="h-4 w-4" /> File
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome project"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Info (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description..."
              rows={3}
            />
          </div>

          {kind === 'link' ? (
            <div className="space-y-1.5">
              <Label htmlFor="link">Project link</Label>
              <Input
                id="link"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="file" className="flex items-center gap-1.5">
                <FileUp className="h-4 w-4" /> File (pdf, image, ppt...)
              </Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setProjectFile(e.target.files?.[0] ?? null)}
              />
              {projectFile && (
                <p className="text-xs text-muted-foreground">{projectFile.name}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="image" className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" /> Cover image (optional)
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            {imageFile && <p className="text-xs text-muted-foreground">{imageFile.name}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Uploading...' : 'Add project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
