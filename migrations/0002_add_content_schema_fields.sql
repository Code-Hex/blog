-- Migration number: 0002 	 2025-06-11T00:00:00.000Z

-- Add missing fields to match content schema
ALTER TABLE posts ADD COLUMN pubDatetime DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE posts ADD COLUMN modDatetime DATETIME;
ALTER TABLE posts ADD COLUMN featured BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN draft BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN ogImage TEXT;
ALTER TABLE posts ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN canonicalURL TEXT;
ALTER TABLE posts ADD COLUMN readingTime TEXT;

-- Update existing published column to match draft logic (draft=false means published=true)
-- We'll handle this logic in the application layer

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_draft ON posts(draft);
CREATE INDEX IF NOT EXISTS idx_posts_pubDatetime ON posts(pubDatetime);