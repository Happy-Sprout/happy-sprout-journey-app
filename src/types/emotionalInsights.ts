
export type EmotionalInsight = {
  id: string;
  child_id: string;
  self_awareness: number;
  self_management: number;
  social_awareness: number;
  relationship_skills: number;
  responsible_decision_making: number;
  created_at: string;
  display_date?: string;
  source_text: string;
};

export type SELAreaKey = 'self_awareness' | 'self_management' | 'social_awareness' | 'relationship_skills' | 'responsible_decision_making';

export type Period = 'weekly' | 'monthly' | 'all';

export type SELPrompt = {
  title: string;
  description: string;
  prompts: {
    younger: string[];
    older: string[];
  };
};
