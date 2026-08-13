import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/access'

export const runtime = 'nodejs'
export const maxDuration = 60

const CATBOX_API = 'https://catbox.moe/user/api.php'

export async function POST(request: Request) {
  if (!(await hasAdminAccess())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Catbox limit is 200MB; keep uploads reasonable for the preview.
  if (file.size > 190 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 190MB)' }, { status: 413 })
  }

  const catboxForm = new FormData()
  catboxForm.append('reqtype', 'fileupload')
  catboxForm.append('fileToUpload', file, file.name || 'upload')

  try {
    const res = await fetch(CATBOX_API, { method: 'POST', body: catboxForm })
    const text = (await res.text()).trim()

    if (!res.ok || !text.startsWith('http')) {
      return NextResponse.json(
        { error: `Catbox upload failed: ${text || res.status}` },
        { status: 502 },
      )
    }

    return NextResponse.json({
      url: text,
      name: file.name,
      type: file.type,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 502 },
    )
  }
}
