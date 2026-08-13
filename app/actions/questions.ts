'use server'

import { db } from '@/lib/db'
import type { Question } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { hasAdminAccess } from '@/lib/access'

function asQuestion(row: Record<string, unknown>): Question {
  return {
    id: Number(row.id),
    askerName: String(row.askerName),
    question: String(row.question),
    answer: row.answer ? String(row.answer) : null,
    answeredAt: (row.answeredAt as string | Date | null) ?? null,
    createdAt: row.createdAt as string | Date,
  }
}

/** Publicly visible: only answered questions, newest first. */
export async function getAnsweredQuestions(): Promise<Question[]> {
  try {
    const rows = await db()`
      SELECT id, asker_name AS "askerName", question, answer,
        answered_at AS "answeredAt", created_at AS "createdAt"
      FROM questions
      WHERE answer IS NOT NULL
      ORDER BY answered_at DESC NULLS LAST, created_at DESC
      LIMIT 50
    `
    return rows.map((row) => asQuestion(row as Record<string, unknown>))
  } catch {
    return []
  }
}

/** Owner-only: every unanswered question. */
export async function getInboxQuestions(): Promise<Question[]> {
  if (!(await hasAdminAccess())) return []
  const rows = await db()`
    SELECT id, asker_name AS "askerName", question, answer,
      answered_at AS "answeredAt", created_at AS "createdAt"
    FROM questions
    WHERE answer IS NULL
    ORDER BY created_at DESC
    LIMIT 100
  `
  return rows.map((row) => asQuestion(row as Record<string, unknown>))
}

export async function askQuestion(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const question = String(formData.get('question') || '').trim()
  if (!name || !question) return { ok: false as const, error: 'Name and question are required.' }
  if (question.length > 280) return { ok: false as const, error: 'Question is too long (max 280).' }
  if (name.length > 60) return { ok: false as const, error: 'Name is too long (max 60).' }

  await db()`
    INSERT INTO questions (asker_name, question)
    VALUES (${name}, ${question})
  `
  revalidatePath('/')
  return { ok: true as const }
}

export async function answerQuestion(id: number, answer: string) {
  if (!(await hasAdminAccess())) return { ok: false as const, error: 'Admin access required' }
  if (!Number.isSafeInteger(id) || id < 1) return { ok: false as const, error: 'Invalid question' }
  const text = answer.trim()
  if (!text || text.length > 1000) return { ok: false as const, error: 'Answer must be 1 to 1,000 characters.' }
  await db()`
    UPDATE questions SET answer = ${text}, answered_at = NOW() WHERE id = ${id}
  `
  revalidatePath('/')
  revalidatePath('/admin/main')
  return { ok: true as const }
}

export async function deleteQuestion(id: number) {
  if (!(await hasAdminAccess())) return { ok: false as const, error: 'Admin access required' }
  if (!Number.isSafeInteger(id) || id < 1) return { ok: false as const, error: 'Invalid question' }
  await db()`DELETE FROM questions WHERE id = ${id}`
  revalidatePath('/')
  revalidatePath('/admin/main')
  return { ok: true as const }
}
