import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { SetupForm } from './setup-form'

export const metadata: Metadata = {
  title: 'Secure setup · Voss Graves',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const setupToken = token ?? ''

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.10),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(217,70,239,0.10),transparent_35%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-8">
        <div className="mb-7 flex items-start gap-3">
          <div className="rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/60">Voss Graves</p>
            <h1 className="mt-1 text-xl font-medium tracking-tight">Secure password setup</h1>
          </div>
        </div>
        {!setupToken ? (
          <p className="rounded-xl border border-red-300/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-100/85">
            This setup link is invalid or expired.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-white/60">
              Choose two different passwords for the admin and personal areas. They are sent over HTTPS and converted directly to Argon2id hashes; plaintext passwords are never stored.
            </p>
            <SetupForm setupToken={setupToken} />
            <p className="mt-6 text-center font-mono text-[10px] leading-5 text-white/35">
              Single-use link · no passwords are logged · minimum 12 characters
            </p>
          </>
        )}
      </section>
    </main>
  )
}
