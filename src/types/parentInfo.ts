
// Define the ParentInfo type
export type ParentInfo = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  emergencyContact: string;
  additionalInfo?: string;
};

// Define the ParentContextType
export type ParentContextType = {
  parentInfo: ParentInfo | null;
  isLoading: boolean;
  setParentInfo: (info: ParentInfo | null) => Promise<void>;
  updateParentInfo: (info: Partial<ParentInfo>) => Promise<void>;
  fetchParentInfo: (userId: string) => Promise<ParentInfo | null>;
  refreshParentInfo: () => Promise<void>;
};
