'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import type { SiteContent } from '@/lib/db/schema'
import { hasAdminAccess } from '@/lib/access'

export type EditableSiteContent = SiteContent

type InterestRow = { position: number; title: string; description: string }
type PublicProfileRow = { alias: string; tagline: string; bio: string }
type PersonalProfileRow = { tagline: string; bio: string }

const fallbackContent: SiteContent = {
  alias: 'Voss Graves',
  tagline: 'Pro vibe coder',
  bio: 'Building free, open-source, ad-free things for the web.',
  loveOneTitle: 'Free & open source',
  loveOneBody: 'Building free, open-source projects that anyone can fork, break, and rebuild.',
  loveTwoTitle: 'Ad-free websites',
  loveTwoBody: 'Building clean, ad-free versions of useful websites so people can browse without distractions.',
  loveThreeTitle: 'Vibe coding',
  loveThreeBody: 'Talking to the model, riding the flow, and letting the tokens fly.',
  privateTagline: 'Private space',
  privateBio: 'A quieter place for personal work, notes, and projects.',
  privateLoveOneTitle: 'Personal projects',
  privateLoveOneBody: 'Private builds, experiments, and works in progress.',
  privateLoveTwoTitle: 'Ideas in progress',
  privateLoveTwoBody: 'Thoughts and concepts that are not ready for the public page.',
  privateLoveThreeTitle: 'Notes and archives',
  privateLoveThreeBody: 'Personal references, files, and things worth keeping.',
}

function interest(rows: InterestRow[], position: number, fallbackTitle: string, fallbackBody: string) {
  const row = rows.find((item) => Number(item.position) === position)
  return { title: row?.title || fallbackTitle, body: row?.description || fallbackBody }
}

/** Composes the original editor shape from intentionally separated Neon records. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const sql = db()
    const [publicProfiles, personalProfiles, publicInterests, personalInterests] = await Promise.all([
      sql`SELECT alias, tagline, bio FROM site_profiles WHERE id = 1 LIMIT 1`,
      sql`SELECT tagline, bio FROM personal_profiles WHERE id = 1 LIMIT 1`,
      sql`SELECT position, title, description FROM site_interests WHERE visibility = 'public' ORDER BY position ASC`,
      sql`SELECT position, title, description FROM site_interests WHERE visibility = 'personal' ORDER BY position ASC`,
    ])
    const publicProfile = (publicProfiles[0] as PublicProfileRow | undefined) ?? fallbackContent
    const personalProfile = (personalProfiles[0] as PersonalProfileRow | undefined) ?? fallbackContent
    const publicRows = publicInterests as InterestRow[]
    const personalRows = personalInterests as InterestRow[]
    const publicOne = interest(publicRows, 1, fallbackContent.loveOneTitle, fallbackContent.loveOneBody)
    const publicTwo = interest(publicRows, 2, fallbackContent.loveTwoTitle, fallbackContent.loveTwoBody)
    const publicThree = interest(publicRows, 3, fallbackContent.loveThreeTitle, fallbackContent.loveThreeBody)
    const privateOne = interest(personalRows, 1, fallbackContent.privateLoveOneTitle, fallbackContent.privateLoveOneBody)
    const privateTwo = interest(personalRows, 2, fallbackContent.privateLoveTwoTitle, fallbackContent.privateLoveTwoBody)
    const privateThree = interest(personalRows, 3, fallbackContent.privateLoveThreeTitle, fallbackContent.privateLoveThreeBody)

    return {
      alias: publicProfile.alias,
      tagline: publicProfile.tagline,
      bio: publicProfile.bio,
      loveOneTitle: publicOne.title,
      loveOneBody: publicOne.body,
      loveTwoTitle: publicTwo.title,
      loveTwoBody: publicTwo.body,
      loveThreeTitle: publicThree.title,
      loveThreeBody: publicThree.body,
      privateTagline: personalProfile.tagline,
      privateBio: personalProfile.bio,
      privateLoveOneTitle: privateOne.title,
      privateLoveOneBody: privateOne.body,
      privateLoveTwoTitle: privateTwo.title,
      privateLoveTwoBody: privateTwo.body,
      privateLoveThreeTitle: privateThree.title,
      privateLoveThreeBody: privateThree.body,
    }
  } catch {
    // Keep the public page visible when Neon is not configured yet. Protected writes still fail closed.
    return fallbackContent
  }
}

function clean(value: unknown, max: number) {
  const result = String(value ?? '').trim()
  return result && result.length <= max ? result : null
}

async function saveInterest(visibility: 'public' | 'personal', position: number, title: string, description: string) {
  await db()`
    INSERT INTO site_interests (visibility, position, title, description)
    VALUES (${visibility}, ${position}, ${title}, ${description})
    ON CONFLICT (visibility, position) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
  `
}

export async function updateSiteContent(input: Partial<EditableSiteContent>) {
  if (!(await hasAdminAccess())) return { ok: false as const, error: 'Admin access required' }

  const isPublic = 'alias' in input
  const fields = isPublic
    ? ['alias', 'tagline', 'bio', 'loveOneTitle', 'loveOneBody', 'loveTwoTitle', 'loveTwoBody', 'loveThreeTitle', 'loveThreeBody'] as const
    : ['privateTagline', 'privateBio', 'privateLoveOneTitle', 'privateLoveOneBody', 'privateLoveTwoTitle', 'privateLoveTwoBody', 'privateLoveThreeTitle', 'privateLoveThreeBody'] as const
  const values = Object.fromEntries(fields.map((key) => [key, clean(input[key], key.includes('Body') || key === 'bio' || key === 'privateBio' ? 500 : 100)])) as Record<string, string | null>
  if (Object.values(values).some((value) => !value)) {
    return { ok: false as const, error: 'Complete every field using the stated character limits.' }
  }

  if (isPublic) {
    await db()`
      INSERT INTO site_profiles (id, alias, tagline, bio)
      VALUES (1, ${values.alias!}, ${values.tagline!}, ${values.bio!})
      ON CONFLICT (id) DO UPDATE SET alias = EXCLUDED.alias, tagline = EXCLUDED.tagline, bio = EXCLUDED.bio, updated_at = NOW()
    `
    await Promise.all([
      saveInterest('public', 1, values.loveOneTitle!, values.loveOneBody!),
      saveInterest('public', 2, values.loveTwoTitle!, values.loveTwoBody!),
      saveInterest('public', 3, values.loveThreeTitle!, values.loveThreeBody!),
    ])
  } else {
    await db()`
      INSERT INTO personal_profiles (id, tagline, bio)
      VALUES (1, ${values.privateTagline!}, ${values.privateBio!})
      ON CONFLICT (id) DO UPDATE SET tagline = EXCLUDED.tagline, bio = EXCLUDED.bio, updated_at = NOW()
    `
    await Promise.all([
      saveInterest('personal', 1, values.privateLoveOneTitle!, values.privateLoveOneBody!),
      saveInterest('personal', 2, values.privateLoveTwoTitle!, values.privateLoveTwoBody!),
      saveInterest('personal', 3, values.privateLoveThreeTitle!, values.privateLoveThreeBody!),
    ])
  }

  revalidatePath('/')
  revalidatePath('/personal')
  revalidatePath('/admin/main')
  revalidatePath('/admin/personal')
  return { ok: true as const }
}
