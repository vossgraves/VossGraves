'use server'

import { db } from '@/lib/db'
import type { Project } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { hasAdminAccess, hasPrivateAccess } from '@/lib/access'

export type Visibility = 'public' | 'personal'

type CreateProjectInput = {
  title: string
  description?: string
  visibility: Visibility
  kind: 'link' | 'file'
  imageUrl?: string
  linkUrl?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
}

function asProject(row: Record<string, unknown>): Project {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    visibility: row.visibility === 'personal' ? 'personal' : 'public',
    kind: row.kind === 'file' ? 'file' : 'link',
    imageUrl: row.imageUrl ? String(row.imageUrl) : null,
    fileUrl: row.fileUrl ? String(row.fileUrl) : null,
    fileName: row.fileName ? String(row.fileName) : null,
    fileType: row.fileType ? String(row.fileType) : null,
    linkUrl: row.linkUrl ? String(row.linkUrl) : null,
    createdAt: row.createdAt as string | Date,
  }
}

export async function getProjects(visibility: Visibility): Promise<Project[]> {
  if (visibility === 'personal' && !(await hasPrivateAccess())) return []
  try {
    const rows = await db()`
      SELECT id, title, description, visibility, kind,
        image_url AS "imageUrl", file_url AS "fileUrl", file_name AS "fileName",
        file_type AS "fileType", link_url AS "linkUrl", created_at AS "createdAt"
      FROM site_projects
      WHERE visibility = ${visibility}
      ORDER BY position ASC, created_at DESC
    `
    return rows.map((row) => asProject(row as Record<string, unknown>))
  } catch {
    return []
  }
}

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/personal')
  revalidatePath('/admin/main')
  revalidatePath('/admin/personal')
}

function safeText(value: string | undefined, max: number) {
  const trimmed = String(value ?? '').trim()
  return trimmed && trimmed.length <= max ? trimmed : null
}

function safeUrl(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

export async function createProject(input: CreateProjectInput) {
  if (!(await hasAdminAccess())) return { ok: false as const, error: 'Admin access required' }
  if (input.visibility !== 'public' && input.visibility !== 'personal') return { ok: false as const, error: 'Invalid visibility' }
  if (input.kind !== 'link' && input.kind !== 'file') return { ok: false as const, error: 'Invalid project type' }

  const title = safeText(input.title, 120)
  const description = input.description ? safeText(input.description, 1000) : null
  const imageUrl = safeUrl(input.imageUrl)
  const linkUrl = safeUrl(input.linkUrl)
  const fileUrl = safeUrl(input.fileUrl)
  const fileName = input.fileName ? safeText(input.fileName, 180) : null
  const fileType = input.fileType ? safeText(input.fileType, 100) : null
  if (!title) return { ok: false as const, error: 'A project title of 120 characters or fewer is required' }
  if (input.description && !description) return { ok: false as const, error: 'Description is too long' }
  if ((input.imageUrl && !imageUrl) || (input.linkUrl && !linkUrl) || (input.fileUrl && !fileUrl)) {
    return { ok: false as const, error: 'Use a valid http or https URL' }
  }
  if (input.kind === 'link' && !linkUrl) return { ok: false as const, error: 'A project link is required' }
  if (input.kind === 'file' && !fileUrl) return { ok: false as const, error: 'A file URL is required' }

  await db()`
    INSERT INTO site_projects (
      visibility, position, title, description, kind, image_url, link_url, file_url, file_name, file_type
    ) VALUES (
      ${input.visibility},
      COALESCE((SELECT MAX(position) + 1 FROM site_projects WHERE visibility = ${input.visibility}), 1),
      ${title}, ${description}, ${input.kind}, ${imageUrl}, ${linkUrl}, ${fileUrl}, ${fileName}, ${fileType}
    )
  `
  revalidateAll()
  return { ok: true as const }
}

export async function deleteProject(id: number) {
  if (!(await hasAdminAccess())) return { ok: false as const, error: 'Admin access required' }
  if (!Number.isSafeInteger(id) || id < 1) return { ok: false as const, error: 'Invalid project' }
  await db()`DELETE FROM site_projects WHERE id = ${id}`
  revalidateAll()
  return { ok: true as const }
}
