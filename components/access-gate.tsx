'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { enterAdmin, enterPrivate } from '@/app/actions/access'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Mode = 'private' | 'admin'

export function AccessGate() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode | null>(null)
  const [password, setPassword] = useState('')
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const openPrivate = () => {
      setPassword('')
      setMode('private')
    }
    const openAdmin = () => {
      setPassword('')
      setMode('admin')
    }
    window.addEventListener('open-private-access', openPrivate)
    window.addEventListener('open-admin-access', openAdmin)
    return () => {
      window.removeEventListener('open-private-access', openPrivate)
      window.removeEventListener('open-admin-access', openAdmin)
    }
  }, [])

  useEffect(() => {
    if (!mode) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(id)
  }, [mode])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!password || !mode) return
    const current = mode
    startTransition(async () => {
      const result = current === 'admin' ? await enterAdmin(password) : await enterPrivate(password)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setMode(null)
      router.push(current === 'admin' ? '/admin/main' : '/personal')
    })
  }

  const isAdmin = mode === 'admin'

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isAdmin ? 'Admin access' : 'Private area'}
          </DialogTitle>
          <DialogDescription>
            Enter the {isAdmin ? 'admin' : 'privacy'} password to continue. Access expires after 30 minutes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isAdmin ? 'Admin password' : 'Privacy password'}
            autoComplete="off"
          />
          <Button type="submit" disabled={pending || !password} className="gap-2">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
