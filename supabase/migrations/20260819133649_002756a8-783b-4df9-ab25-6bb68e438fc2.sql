CREATE TABLE public.team_profiles (
  slot_id TEXT PRIMARY KEY,
  name TEXT,
  photo TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_profiles TO authenticated;
GRANT ALL ON public.team_profiles TO service_role;

ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team profiles are publicly readable"
  ON public.team_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can add a team profile"
  ON public.team_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can edit a team profile"
  ON public.team_profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can reset a team profile"
  ON public.team_profiles FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_profiles;