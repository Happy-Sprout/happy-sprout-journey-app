
-- Create a function that will create a parent profile with RLS permissions
-- This will be called from the client using RPC
CREATE OR REPLACE FUNCTION public.create_parent_profile(
  user_id UUID,
  user_name TEXT,
  user_email TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert the parent record with the user's ID
  INSERT INTO public.parents (
    id,
    name,
    relationship,
    email,
    emergency_contact
  ) VALUES (
    user_id,
    user_name,
    'Parent',
    user_email,
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add Row Level Security to parents table
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own profile
CREATE POLICY select_own_profile ON public.parents
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY update_own_profile ON public.parents
    FOR UPDATE
    USING (auth.uid() = id);
