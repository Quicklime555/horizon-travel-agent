-- Supabase Schema for Horizon Travel AI
-- PRD Section 6 Implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Trip Plans table
CREATE TABLE IF NOT EXISTS trip_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  origin text,
  destination text NOT NULL,
  start_date date,
  end_date date,
  budget numeric,
  preferences jsonb DEFAULT '[]'::jsonb,
  pace text,
  status text DEFAULT 'pending', -- pending, generating, completed, failed
  created_at timestamptz DEFAULT now()
);

-- 2. Itinerary Days table
CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_plan_id uuid REFERENCES trip_plans(id) ON DELETE CASCADE,
  day_index int NOT NULL,
  title text,
  summary text,
  day_budget numeric,
  created_at timestamptz DEFAULT now()
);

-- 3. Itinerary Items table
CREATE TABLE IF NOT EXISTS itinerary_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_day_id uuid REFERENCES itinerary_days(id) ON DELETE CASCADE,
  start_time text,
  end_time text,
  place_name text NOT NULL,
  category text,
  notes text,
  estimated_cost numeric,
  created_at timestamptz DEFAULT now()
);

-- 4. Planner Runs table (Monitoring)
CREATE TABLE IF NOT EXISTS planner_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_plan_id uuid REFERENCES trip_plans(id) ON DELETE CASCADE,
  provider text,
  latency_ms int,
  status text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 5. Trip Feedback table
CREATE TABLE IF NOT EXISTS trip_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_plan_id uuid REFERENCES trip_plans(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score int CHECK (score >= 1 AND score <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- 6. Profiles table (Extra User Data)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  wechat_openid text UNIQUE,
  wechat_unionid text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for trip_plans
DROP POLICY IF EXISTS "Users can view their own trip plans" ON trip_plans;
CREATE POLICY "Users can view their own trip plans" ON trip_plans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trip plans" ON trip_plans;
CREATE POLICY "Users can insert their own trip plans" ON trip_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trip plans" ON trip_plans;
CREATE POLICY "Users can update their own trip plans" ON trip_plans FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trip plans" ON trip_plans;
CREATE POLICY "Users can delete their own trip plans" ON trip_plans FOR DELETE USING (auth.uid() = user_id);

-- Policies for itinerary_days
DROP POLICY IF EXISTS "Users can view days of their trip plans" ON itinerary_days;
CREATE POLICY "Users can view days of their trip plans" ON itinerary_days FOR SELECT 
  USING (EXISTS (SELECT 1 FROM trip_plans WHERE id = itinerary_days.trip_plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert days for their trip plans" ON itinerary_days;
CREATE POLICY "Users can insert days for their trip plans" ON itinerary_days FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM trip_plans WHERE id = itinerary_days.trip_plan_id AND user_id = auth.uid()));

-- Policies for itinerary_items
DROP POLICY IF EXISTS "Users can view items of their trip plans" ON itinerary_items;
CREATE POLICY "Users can view items of their trip plans" ON itinerary_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM itinerary_days d 
    JOIN trip_plans p ON d.trip_plan_id = p.id 
    WHERE d.id = itinerary_items.itinerary_day_id AND p.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert items for their trip plans" ON itinerary_items;
CREATE POLICY "Users can insert items for their trip plans" ON itinerary_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM itinerary_days d 
    JOIN trip_plans p ON d.trip_plan_id = p.id 
    WHERE d.id = itinerary_items.itinerary_day_id AND p.user_id = auth.uid()
  ));

-- Policies for feedback
DROP POLICY IF EXISTS "Users can manage their own feedback" ON trip_feedback;
CREATE POLICY "Users can manage their own feedback" ON trip_feedback FOR ALL USING (auth.uid() = user_id);

-- Policies for planner_runs (Admin only or system level, here we allow users to see their own runs for transparency)
DROP POLICY IF EXISTS "Users can view their own planner runs" ON planner_runs;
CREATE POLICY "Users can view their own planner runs" ON planner_runs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM trip_plans WHERE id = planner_runs.trip_plan_id AND user_id = auth.uid()));

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', COALESCE(new.raw_user_meta_data->>'role', 'user'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
