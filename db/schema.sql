-- Apply in Neon SQL Editor before enabling sign-in or editing.
-- Credentials are stored only as Argon2id hashes; no plaintext password is stored in this schema.

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

-- Public and personal profiles are intentionally isolated. Public rendering never queries personal_profiles.
CREATE TABLE IF NOT EXISTS site_profiles (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  alias TEXT NOT NULL DEFAULT 'Voss Graves',
  tagline TEXT NOT NULL DEFAULT 'Pro vibe coder',
  bio TEXT NOT NULL DEFAULT 'Building free, open-source, ad-free things for the web.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_profiles (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tagline TEXT NOT NULL DEFAULT 'Private space',
  bio TEXT NOT NULL DEFAULT 'A quieter place for personal work, notes, and projects.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_interests (
  id BIGSERIAL PRIMARY KEY,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'personal')),
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (visibility, position)
);

-- Archive project support includes both links and Catbox-hosted files with optional cover images.
CREATE TABLE IF NOT EXISTS site_projects (
  id BIGSERIAL PRIMARY KEY,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'personal')),
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'link' CHECK (kind IN ('link', 'file')),
  image_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS site_projects_visibility_position_idx ON site_projects (visibility, position, created_at DESC);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  asker_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS questions_answered_idx ON questions (answered_at DESC) WHERE answer IS NOT NULL;

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
