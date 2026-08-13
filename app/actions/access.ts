'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { authenticate, authenticatePrivate, downgradeToPrivate, revokeAll } from '@/lib/access'

/** Enter the personal area. A valid administrator code also grants personal access. */
export async function enterPrivate(password: string) {
  return authenticatePrivate(password)
}

/** Gain administrator access; the resulting session also grants personal access. */
export async function enterAdmin(password: string) {
  return authenticate('admin', password)
}

/** End the current opaque session and return to the public profile. */
export async function exitEverything() {
  await revokeAll()
  revalidatePath('/', 'layout')
  redirect('/')
}

/** Replace an admin session with a lower-privilege personal session. */
export async function exitAdminOnly() {
  const downgraded = await downgradeToPrivate()
  revalidatePath('/', 'layout')
  redirect(downgraded ? '/personal' : '/')
}
