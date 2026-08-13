"use server";

import { redirect } from "next/navigation";
import { authenticate, requireScope, signOut } from "../lib/auth";
import { db } from "../lib/db";

export type ActionState = { ok: boolean; message: string } | null;

const fail = (message: string): ActionState => ({ ok: false, message });
const success = (message: string): ActionState => ({ ok: true, message });

function text(formData: FormData, key: string, max = 2000) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function requiredText(formData: FormData, key: string, max = 2000) {
  const value = text(formData, key, max);
  return value || null;
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function enterAdmin(formData: FormData) {
  const result = await authenticate("admin", text(formData, "password", 256));
  if (!result.ok) return result;
  redirect("/admin/main");
}

export async function enterPrivate(formData: FormData) {
  const result = await authenticate("personal", text(formData, "password", 256));
  if (!result.ok) return result;
  redirect("/personal");
}

export async function exitAccess() {
  await signOut();
  redirect("/");
}

export async function savePublicContent(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireScope("admin");
  const name = requiredText(formData, "name", 80);
  const tagline = requiredText(formData, "tagline", 160);
  const bio = requiredText(formData, "bio", 2000);
  if (!name || !tagline || !bio) return fail("Name, tagline, and bio are required.");

  const sql = db();
  await sql`
    UPDATE site_profiles SET name = ${name}, tagline = ${tagline}, bio = ${bio}, updated_at = NOW()
    WHERE id = 1
  `;
  for (let position = 1; position <= 3; position += 1) {
    const title = requiredText(formData, `interest_${position}_title`, 120);
    const description = requiredText(formData, `interest_${position}_description`, 500);
    if (!title || !description) return fail("Each public interest needs a title and description.");
    await sql`
      INSERT INTO site_interests (visibility, position, title, description)
      VALUES ('public', ${position}, ${title}, ${description})
      ON CONFLICT (visibility, position) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
    `;
  }
  return success("Public content saved to Neon.");
}

export async function savePersonalContent(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireScope("admin");
  const tagline = requiredText(formData, "tagline", 160);
  const bio = requiredText(formData, "bio", 2000);
  if (!tagline || !bio) return fail("Private tagline and bio are required.");

  const sql = db();
  await sql`
    UPDATE personal_profiles SET tagline = ${tagline}, bio = ${bio}, updated_at = NOW()
    WHERE id = 1
  `;
  for (let position = 1; position <= 3; position += 1) {
    const title = requiredText(formData, `interest_${position}_title`, 120);
    const description = requiredText(formData, `interest_${position}_description`, 500);
    if (!title || !description) return fail("Each private interest needs a title and description.");
    await sql`
      INSERT INTO site_interests (visibility, position, title, description)
      VALUES ('personal', ${position}, ${title}, ${description})
      ON CONFLICT (visibility, position) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
    `;
  }
  return success("Private content saved to Neon.");
}

export async function addProject(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireScope("admin");
  const visibility = text(formData, "visibility", 20) === "personal" ? "personal" : "public";
  const name = requiredText(formData, "name", 120);
  const description = requiredText(formData, "description", 500);
  const href = safeUrl(text(formData, "href", 500));
  if (!name || !description || !href) return fail("Project name, description, and a valid HTTP(S) link are required.");

  const sql = db();
  const positions = await sql`
    SELECT COALESCE(MAX(position), 0) + 1 AS next_position
    FROM site_projects WHERE visibility = ${visibility}
  `;
  const position = Number((positions[0] as { next_position?: number } | undefined)?.next_position ?? 1);
  await sql`
    INSERT INTO site_projects (visibility, position, name, description, href)
    VALUES (${visibility}, ${position}, ${name}, ${description}, ${href})
  `;
  return success("Project added to Neon.");
}

export async function askQuestion(_: ActionState, formData: FormData): Promise<ActionState> {
  const prompt = requiredText(formData, "prompt", 1000);
  if (!prompt) return fail("Write a question first.");
  await db()`INSERT INTO questions (prompt) VALUES (${prompt})`;
  return success("Question sent.");
}

export async function answerQuestion(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireScope("admin");
  const id = Number.parseInt(text(formData, "id", 30), 10);
  const answer = requiredText(formData, "answer", 2000);
  if (!Number.isSafeInteger(id) || id <= 0 || !answer) return fail("A valid question and answer are required.");
  await db()`UPDATE questions SET answer = ${answer}, answered_at = NOW() WHERE id = ${id}`;
  return success("Answer saved to Neon.");
}
