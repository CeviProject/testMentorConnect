-- Create mentor_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  bio TEXT,
  domains TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10, 2) DEFAULT 50.00,
  availability_hours JSONB DEFAULT '{}'::jsonb,
  education TEXT,
  company TEXT,
  position TEXT,
  languages TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availabilities table if it doesn't exist
CREATE TABLE IF NOT EXISTS availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES mentor_profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create index on mentor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_availabilities_mentor_id ON availabilities(mentor_id);

-- Create index on start_time for date range queries
CREATE INDEX IF NOT EXISTS idx_availabilities_start_time ON availabilities(start_time);

-- Create function to get available mentors
CREATE OR REPLACE FUNCTION get_available_mentors(domain_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  mentor_id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  domains TEXT[],
  hourly_rate DECIMAL(10, 2),
  experience_years INTEGER,
  availability_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id as mentor_id,
    p.name,
    p.email,
    p.avatar_url,
    mp.bio,
    mp.domains,
    mp.hourly_rate,
    mp.experience_years,
    COUNT(a.id) as availability_count
  FROM mentor_profiles mp
  JOIN profiles p ON mp.id = p.id
  LEFT JOIN availabilities a ON mp.id = a.mentor_id AND a.is_booked = FALSE AND a.start_time > NOW()
  WHERE 
    (domain_filter IS NULL OR mp.domains @> ARRAY[domain_filter])
  GROUP BY mp.id, p.name, p.email, p.avatar_url, mp.bio, mp.domains, mp.hourly_rate, mp.experience_years
  ORDER BY availability_count DESC, mp.hourly_rate ASC;
END;
$$ LANGUAGE plpgsql;
