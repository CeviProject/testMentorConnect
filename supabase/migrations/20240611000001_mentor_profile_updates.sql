-- Add new fields to mentor_profiles table
ALTER TABLE IF EXISTS mentor_profiles
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS social_links JSONB;

-- Enable realtime for mentor_profiles table
alter publication supabase_realtime add table mentor_profiles;
