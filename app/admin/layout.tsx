import { redirect } from 'next/navigation'
import { hasAdminAccess } from '@/lib/access'
import { AdminNav } from '@/components/admin-nav'
import { Toaster } from '@/components/ui/sonner'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authoritative check: a valid, unexpired admin key must exist in the database.
  if (!(await hasAdminAccess())) redirect('/')

  return (
    <>
      <Toaster position="top-center" theme="dark" />
      <main className="relative z-10 mx-auto min-h-dvh max-w-4xl px-4 py-8 sm:px-6">
        <AdminNav />
        {children}
      </main>
    </>
  )
}
