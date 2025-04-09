
// Define admin-specific types
export type JournalFlag = {
  id: string;
  entry_id: string;
  child_id: string | null;
  flag_reason: string;
  severity: 'high' | 'medium' | 'low';
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  // Joined data
  journal_entry?: {
    title: string | null;
    content: string;
    created_at: string;
  };
  child?: {
    nickname: string;
    age: number;
  };
  parent?: {
    name: string;
    email: string;
  };
};

export type JournalFilterState = {
  severity: string;
  status: string;
};
