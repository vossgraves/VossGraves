'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

const MIN_PASSWORD_LENGTH = 12

type SetupFormProps = {
  setupToken: string
}

export function SetupForm({ setupToken }: SetupFormProps) {
  const [adminPassword, setAdminPassword] = useState('')
  const [personalPassword, setPersonalPassword] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [showPersonal, setShowPersonal] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (adminPassword.length < MIN_PASSWORD_LENGTH || personalPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for each password.`)
      return
    }
    if (adminPassword === personalPassword) {
      setError('Use two different passwords.')
      return
    }

    setPending(true)
    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-setup-token': setupToken },
        body: JSON.stringify({ adminPassword, personalPassword }),
      })
      const result = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !result.ok) {
        setError(result.error || 'Password setup could not be completed.')
        return
      }
      setAdminPassword('')
      setPersonalPassword('')
      setComplete(true)
    } catch {
      setError('The setup request failed. Check the connection and try once more.')
    } finally {
      setPending(false)
    }
  }

  if (complete) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-300" />
        <h2 className="font-mono text-lg text-white">Setup complete</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Both passwords were converted to Argon2id hashes and stored securely. This setup link is now permanently disabled.
        </p>
        <Link className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 font-mono text-xs text-white/75 transition hover:border-white/35 hover:text-white" href="/">
          Return to Voss Graves
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-white/55" htmlFor="admin-password">
          Admin password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/50"
            type={showAdmin ? 'text' : 'password'}
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={256}
            required
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white" type="button" aria-label={showAdmin ? 'Hide admin password' : 'Show admin password'} onClick={() => setShowAdmin((value) => !value)}>
            {showAdmin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-white/55" htmlFor="personal-password">
          Personal password
        </label>
        <div className="relative">
          <input
            id="personal-password"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-300/50"
            type={showPersonal ? 'text' : 'password'}
            value={personalPassword}
            onChange={(event) => setPersonalPassword(event.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={256}
            required
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white" type="button" aria-label={showPersonal ? 'Hide personal password' : 'Show personal password'} onClick={() => setShowPersonal((value) => !value)}>
            {showPersonal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error ? <p className="rounded-xl border border-red-300/20 bg-red-400/5 px-4 py-3 text-sm text-red-100/85">{error}</p> : null}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200/30 bg-cyan-200/10 px-4 py-3 font-mono text-sm text-cyan-50 transition hover:border-cyan-200/55 hover:bg-cyan-200/15 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {pending ? 'Hashing securely…' : 'Initialize passwords'}
      </button>
    </form>
  )
}
