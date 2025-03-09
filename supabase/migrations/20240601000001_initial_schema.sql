-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT CHECK (role IN ('mentor', 'mentee')),
  avatar_url TEXT,
  bio TEXT,
  domains TEXT[],
  hourly_rate NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availabilities table
CREATE TABLE IF NOT EXISTS availabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('requested', 'confirmed', 'declined', 'completed', 'cancelled')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  notes TEXT,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('request', 'confirmation', 'reminder', 'summary', 'follow-up')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Mentees can view mentor profiles" ON profiles;
CREATE POLICY "Mentees can view mentor profiles"
  ON profiles FOR SELECT
  USING (role = 'mentor');

-- Availabilities policies
DROP POLICY IF EXISTS "Mentors can manage their own availability" ON availabilities;
CREATE POLICY "Mentors can manage their own availability"
  ON availabilities FOR ALL
  USING (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentees can view mentor availability" ON availabilities;
CREATE POLICY "Mentees can view mentor availability"
  ON availabilities FOR SELECT
  TO authenticated
  USING (true);

-- Sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

DROP POLICY IF EXISTS "Mentees can create session requests" ON sessions;
CREATE POLICY "Mentees can create session requests"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = mentee_id);

DROP POLICY IF EXISTS "Mentors can update their sessions" ON sessions;
CREATE POLICY "Mentors can update their sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = mentor_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mentee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table availabilities;
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table notifications;