'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { updateSiteContent, type EditableSiteContent } from '@/app/actions/site-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Scope = 'public' | 'private'

const PUBLIC_KEYS: (keyof EditableSiteContent)[] = [
  'alias', 'tagline', 'bio',
  'loveOneTitle', 'loveOneBody', 'loveTwoTitle', 'loveTwoBody', 'loveThreeTitle', 'loveThreeBody',
]
const PRIVATE_KEYS: (keyof EditableSiteContent)[] = [
  'privateTagline', 'privateBio',
  'privateLoveOneTitle', 'privateLoveOneBody', 'privateLoveTwoTitle', 'privateLoveTwoBody',
  'privateLoveThreeTitle', 'privateLoveThreeBody',
]

export function ContentEditor({
  content,
  scope = 'public',
}: {
  content: EditableSiteContent
  scope?: Scope
}) {
  const router = useRouter()
  const [form, setForm] = useState(content)
  const [pending, startTransition] = useTransition()

  function set(key: keyof EditableSiteContent, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const keys = scope === 'public' ? PUBLIC_KEYS : PRIVATE_KEYS
    const payload = Object.fromEntries(keys.map((key) => [key, form[key]]))
    startTransition(async () => {
      const result = await updateSiteContent(payload)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Saved')
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h3 className="font-medium">{scope === 'public' ? 'Edit public profile' : 'Edit private profile'}</h3>
        <p className="text-sm text-muted-foreground">Changes are saved to Neon and appear immediately.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {scope === 'public' ? (
          <>
            <Field label="Public name"><Input value={form.alias} onChange={(e) => set('alias', e.target.value)} maxLength={80} /></Field>
            <Field label="Tagline"><Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} maxLength={100} /></Field>
            <Field label="Bio" wide><Textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} maxLength={500} rows={4} /></Field>
            <InterestFields index="1" title={form.loveOneTitle} body={form.loveOneBody} onTitle={(v) => set('loveOneTitle', v)} onBody={(v) => set('loveOneBody', v)} />
            <InterestFields index="2" title={form.loveTwoTitle} body={form.loveTwoBody} onTitle={(v) => set('loveTwoTitle', v)} onBody={(v) => set('loveTwoBody', v)} />
            <InterestFields index="3" title={form.loveThreeTitle} body={form.loveThreeBody} onTitle={(v) => set('loveThreeTitle', v)} onBody={(v) => set('loveThreeBody', v)} />
          </>
        ) : (
          <>
            <Field label="Private tagline"><Input value={form.privateTagline} onChange={(e) => set('privateTagline', e.target.value)} maxLength={100} /></Field>
            <Field label="Private bio" wide><Textarea value={form.privateBio} onChange={(e) => set('privateBio', e.target.value)} maxLength={500} rows={4} /></Field>
            <InterestFields index="1" prefix="Private interest" title={form.privateLoveOneTitle} body={form.privateLoveOneBody} onTitle={(v) => set('privateLoveOneTitle', v)} onBody={(v) => set('privateLoveOneBody', v)} />
            <InterestFields index="2" prefix="Private interest" title={form.privateLoveTwoTitle} body={form.privateLoveTwoBody} onTitle={(v) => set('privateLoveTwoTitle', v)} onBody={(v) => set('privateLoveTwoBody', v)} />
            <InterestFields index="3" prefix="Private interest" title={form.privateLoveThreeTitle} body={form.privateLoveThreeBody} onTitle={(v) => set('privateLoveThreeTitle', v)} onBody={(v) => set('privateLoveThreeBody', v)} />
          </>
        )}
      </div>

      <Button type="submit" disabled={pending} className="mt-5 gap-2">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save changes
      </Button>
    </form>
  )
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={wide ? 'grid gap-2 sm:col-span-2' : 'grid gap-2'}><Label>{label}</Label>{children}</div>
}

function InterestFields({ index, prefix = 'Stuff I love', title, body, onTitle, onBody }: { index: string; prefix?: string; title: string; body: string; onTitle: (value: string) => void; onBody: (value: string) => void }) {
  return (
    <div className="grid gap-3 rounded-xl border border-border p-4 sm:col-span-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{prefix} {index}</p>
      <Field label="Title"><Input value={title} onChange={(e) => onTitle(e.target.value)} maxLength={80} /></Field>
      <Field label="Description"><Textarea value={body} onChange={(e) => onBody(e.target.value)} maxLength={300} rows={2} /></Field>
    </div>
  )
}
