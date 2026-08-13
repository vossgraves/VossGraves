import "server-only";

import { db } from "./db";

export type Visibility = "public" | "personal";

export type Profile = {
  name: string;
  tagline: string;
  bio: string;
};

export type Interest = {
  id: number;
  title: string;
  description: string;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  href: string;
};

export type Question = {
  id: number;
  prompt: string;
  answer: string | null;
  created_at: string | Date;
};

export type SiteData = {
  profile: Profile;
  interests: Interest[];
  projects: Project[];
  questions: Question[];
};

export type PersonalData = {
  profile: Omit<Profile, "name">;
  interests: Interest[];
  projects: Project[];
};

const publicFallback: SiteData = {
  profile: {
    name: "Voss Graves",
    tagline: "Noob vibe coder",
    bio: "I’m a noob vibe coder with token usage through the roof. I talk to the Claude and other AI and ship useful things — mostly free, open-source and ad-free versions of websites.",
  },
  interests: [
    { id: 1, title: "Free & open source", description: "Building free, open-source projects that anyone can fork, break, and rebuild." },
    { id: 2, title: "Ad-free websites", description: "Building clean, ad-free versions of useful websites so people can browse without distractions." },
    { id: 3, title: "Vibe coding", description: "Talking to the model, riding the flow, and letting the tokens fly." },
  ],
  projects: [
    { id: 1, name: "DocGrab", description: "Allows you to download Scribd and Slideshare with ease", href: "https://docgrab.vercel.app/" },
  ],
  questions: [],
};

const personalFallback: PersonalData = {
  profile: {
    tagline: "Private space",
    bio: "A quieter place for personal work, notes, and projects.",
  },
  interests: [
    { id: 1, title: "Personal projects", description: "Private builds, experiments, and works in progress." },
    { id: 2, title: "Ideas in progress", description: "Thoughts and concepts that are not ready for the public page." },
    { id: 3, title: "Notes and archives", description: "Personal references, files, and things worth keeping." },
  ],
  projects: [],
};

function asNumber(value: unknown) {
  return Number(value);
}

export async function getPublicData(): Promise<SiteData> {
  try {
    const sql = db();
    const [profiles, interests, projects, questions] = await Promise.all([
      sql`SELECT name, tagline, bio FROM site_profiles WHERE id = 1 LIMIT 1`,
      sql`SELECT id, title, description FROM site_interests WHERE visibility = 'public' ORDER BY position ASC`,
      sql`SELECT id, name, description, href FROM site_projects WHERE visibility = 'public' ORDER BY position ASC`,
      sql`SELECT id, prompt, answer, created_at FROM questions WHERE answer IS NOT NULL ORDER BY answered_at DESC NULLS LAST, created_at DESC LIMIT 20`,
    ]);
    return {
      profile: (profiles[0] as Profile | undefined) ?? publicFallback.profile,
      interests: interests.length ? interests.map((row) => ({ ...row, id: asNumber(row.id) })) as Interest[] : publicFallback.interests,
      projects: projects.length ? projects.map((row) => ({ ...row, id: asNumber(row.id) })) as Project[] : publicFallback.projects,
      questions: questions.map((row) => ({ ...row, id: asNumber(row.id) })) as Question[],
    };
  } catch {
    return publicFallback;
  }
}

export async function getPersonalData(): Promise<PersonalData> {
  const sql = db();
  const [profiles, interests, projects] = await Promise.all([
    sql`SELECT tagline, bio FROM personal_profiles WHERE id = 1 LIMIT 1`,
    sql`SELECT id, title, description FROM site_interests WHERE visibility = 'personal' ORDER BY position ASC`,
    sql`SELECT id, name, description, href FROM site_projects WHERE visibility = 'personal' ORDER BY position ASC`,
  ]);
  return {
    profile: (profiles[0] as PersonalData["profile"] | undefined) ?? personalFallback.profile,
    interests: interests.map((row) => ({ ...row, id: asNumber(row.id) })) as Interest[],
    projects: projects.map((row) => ({ ...row, id: asNumber(row.id) })) as Project[],
  };
}

export async function getUnansweredQuestions(): Promise<Question[]> {
  const rows = await db()`SELECT id, prompt, answer, created_at FROM questions WHERE answer IS NULL ORDER BY created_at DESC LIMIT 100`;
  return rows.map((row) => ({ ...row, id: asNumber(row.id) })) as Question[];
}

export async function getAdminData() {
  const [publicData, personalData] = await Promise.all([getPublicData(), getPersonalData()]);
  return { publicData, personalData };
}
