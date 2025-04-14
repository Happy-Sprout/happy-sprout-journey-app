
-- Create the sel_insights table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sel_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  self_awareness DOUBLE PRECISION NOT NULL,
  self_management DOUBLE PRECISION NOT NULL,
  social_awareness DOUBLE PRECISION NOT NULL,
  relationship_skills DOUBLE PRECISION NOT NULL,
  responsible_decision_making DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_text TEXT
);

-- Add RLS policies
ALTER TABLE public.sel_insights ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own children's insights
CREATE POLICY select_own_child_insights
  ON public.sel_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = sel_insights.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create policy to allow users to insert insights for their own children
CREATE POLICY insert_own_child_insights
  ON public.sel_insights
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = sel_insights.child_id
      AND children.parent_id = auth.uid()
    )
  );
