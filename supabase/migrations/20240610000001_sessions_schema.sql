-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES profiles(id) NOT NULL,
  mentee_id UUID REFERENCES profiles(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mentor_profiles table for additional mentor details
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  domains TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  bio TEXT,
  availability_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create availabilities table
CREATE TABLE IF NOT EXISTS availabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES profiles(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create video_calls table
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  stream_call_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  recording_url TEXT,
  transcript_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Sessions policies
DROP POLICY IF EXISTS "Mentors can view their sessions" ON sessions;
CREATE POLICY "Mentors can view their sessions"
  ON sessions FOR SELECT
  USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentees can view their sessions" ON sessions;
CREATE POLICY "Mentees can view their sessions"
  ON sessions FOR SELECT
  USING (mentee_id = auth.uid());

DROP POLICY IF EXISTS "Mentees can create sessions" ON sessions;
CREATE POLICY "Mentees can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (mentee_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update their sessions" ON sessions;
CREATE POLICY "Mentors can update their sessions"
  ON sessions FOR UPDATE
  USING (mentor_id = auth.uid());

-- Mentor profiles policies
DROP POLICY IF EXISTS "Mentors can view their profiles" ON mentor_profiles;
CREATE POLICY "Mentors can view their profiles"
  ON mentor_profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update their profiles" ON mentor_profiles;
CREATE POLICY "Mentors can update their profiles"
  ON mentor_profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Mentors can insert their profiles" ON mentor_profiles;
CREATE POLICY "Mentors can insert their profiles"
  ON mentor_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Public can view mentor profiles" ON mentor_profiles;
CREATE POLICY "Public can view mentor profiles"
  ON mentor_profiles FOR SELECT
  USING (true);

-- Availabilities policies
DROP POLICY IF EXISTS "Mentors can view their availabilities" ON availabilities;
CREATE POLICY "Mentors can view their availabilities"
  ON availabilities FOR SELECT
  USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can insert their availabilities" ON availabilities;
CREATE POLICY "Mentors can insert their availabilities"
  ON availabilities FOR INSERT
  WITH CHECK (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update their availabilities" ON availabilities;
CREATE POLICY "Mentors can update their availabilities"
  ON availabilities FOR UPDATE
  USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Public can view availabilities" ON availabilities;
CREATE POLICY "Public can view availabilities"
  ON availabilities FOR SELECT
  USING (true);

-- Enable realtime for all tables
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table mentor_profiles;
alter publication supabase_realtime add table availabilities;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table video_calls;
