
// Define admin-specific types
export type JournalFlag = {
  id: string;
  entry_id: string;
  child_id: string | null;
  flag_reason: string;
  severity: 'high' | 'medium' | 'low' | string; // Add string to handle any string values from DB
  status: 'pending' | 'reviewed' | 'dismissed' | string; // Add string to handle any string values from DB
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  // Joined data
  journal_entry?: {
    title: string | null;
    content: string;
    created_at: string;
  } | null; // Add null to handle potential null values
  child?: {
    nickname: string;
    age: number;
  } | null; // Add null to handle potential null values
  parent?: {
    name: string;
    email: string;
  } | null; // Add null to handle potential null values
};

export type JournalFilterState = {
  severity: string;
  status: string;
};
