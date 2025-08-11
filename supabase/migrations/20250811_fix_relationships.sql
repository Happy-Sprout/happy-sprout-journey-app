-- Fix foreign key relationships

-- Add foreign key constraint to sel_insights table
ALTER TABLE public.sel_insights 
ADD CONSTRAINT sel_insights_child_id_fkey 
FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;

-- Add foreign key constraint to journal_monitoring table  
ALTER TABLE public.journal_monitoring
ADD CONSTRAINT journal_monitoring_entry_id_fkey
FOREIGN KEY (entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;

-- Add some sample notification templates if they don't exist
INSERT INTO public.notification_templates (name, title_template, body_template, trigger_event, for_parent, active, description) 
VALUES 
  ('Daily Check-in Reminder', 'Time for your daily check-in! 🌟', 'Hi {{child_name}}! How are you feeling today? Let''s record your emotions and thoughts.', 'daily_checkin_reminder', false, true, 'Reminds children to complete their daily emotional check-in'),
  ('Parent Progress Update', '{{child_name}}''s Weekly Progress', '{{child_name}} completed {{checkin_count}} check-ins this week and earned {{xp_earned}} XP points!', 'weekly_progress', true, true, 'Weekly progress summary for parents'),
  ('Streak Achievement', 'Amazing streak! 🔥', 'Wow {{child_name}}! You''ve maintained a {{streak_days}}-day streak. Keep up the great work!', 'streak_milestone', false, true, 'Celebrates milestone achievements'),
  ('Low Mood Alert', 'Attention: {{child_name}} needs support', 'We''ve noticed {{child_name}} has been experiencing low moods. Consider checking in with them.', 'low_mood_detected', true, true, 'Alerts parents when low mood patterns are detected')
ON CONFLICT (name) DO NOTHING;
