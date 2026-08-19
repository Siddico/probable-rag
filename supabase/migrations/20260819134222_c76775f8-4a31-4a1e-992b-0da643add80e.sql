GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_profiles TO authenticated;
GRANT ALL ON public.team_profiles TO service_role;