CREATE TABLE IF NOT EXISTS auth_passwords (
  scope TEXT PRIMARY KEY CHECK (scope IN ('admin', 'personal')),
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('admin', 'personal')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_expires_idx ON auth_sessions (expires_at);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  scope TEXT NOT NULL CHECK (scope IN ('admin', 'personal')),
  subject_hash TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0,
  blocked_until TIMESTAMPTZ,
  PRIMARY KEY (scope, subject_hash)
);

CREATE TABLE IF NOT EXISTS site_profiles (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Voss Graves',
  tagline TEXT NOT NULL DEFAULT 'Noob vibe coder',
  bio TEXT NOT NULL DEFAULT 'I’m a noob vibe coder with token usage through the roof. I talk to the Claude and other AI and ship useful things — mostly free, open-source and ad-free versions of websites.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_interests (
  id BIGSERIAL PRIMARY KEY,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'personal')),
  position SMALLINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (visibility, position)
);

CREATE TABLE IF NOT EXISTS site_projects (
  id BIGSERIAL PRIMARY KEY,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'personal')),
  position SMALLINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  href TEXT NOT NULL,
  UNIQUE (visibility, position)
);

CREATE TABLE IF NOT EXISTS personal_profiles (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tagline TEXT NOT NULL DEFAULT 'Private space',
  bio TEXT NOT NULL DEFAULT 'A quieter place for personal work, notes, and projects.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

INSERT INTO site_profiles (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO personal_profiles (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO site_interests (visibility, position, title, description) VALUES
  ('public', 1, 'Free & open source', 'Building free, open-source projects that anyone can fork, break, and rebuild.'),
  ('public', 2, 'Ad-free websites', 'Building clean, ad-free versions of useful websites so people can browse without distractions.'),
  ('public', 3, 'Vibe coding', 'Talking to the model, riding the flow, and letting the tokens fly.'),
  ('personal', 1, 'Personal projects', 'Private builds, experiments, and works in progress.'),
  ('personal', 2, 'Ideas in progress', 'Thoughts and concepts that are not ready for the public page.'),
  ('personal', 3, 'Notes and archives', 'Personal references, files, and things worth keeping.')
ON CONFLICT (visibility, position) DO NOTHING;

INSERT INTO site_projects (visibility, position, name, description, href) VALUES
  ('public', 1, 'DocGrab', 'Allows you to download Scribd and Slideshare with ease', 'https://docgrab.vercel.app/');
