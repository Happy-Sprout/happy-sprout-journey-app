
export type AssessmentType = 'PRE' | 'POST';

export type AssessmentStatus = 'Not Started' | 'In Progress' | 'Completed';

export type ComparisonStatus = 'PRE_PENDING' | 'POST_PENDING' | 'AVAILABLE' | 'DISABLED';

export type SELDimension = 
  | 'Self-Awareness' 
  | 'Self-Management' 
  | 'Social Awareness' 
  | 'Relationship Skills' 
  | 'Responsible Decision Making';

export interface AssessmentQuestion {
  id: string;
  question_code: string;
  dimension: SELDimension;
  question_text: string;
  display_order: number;
}

export interface AssessmentAnswer {
  question_code: string;
  answer_value: number;
}

export interface AssessmentResult {
  id: string;
  child_id: string;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  completion_date: string | null;
  scores_by_dimension: Record<SELDimension, number> | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentStatusResponse {
  enabled: boolean;
  nextAssessment: AssessmentType | null;
  preStatus: AssessmentStatus;
  postStatus: AssessmentStatus;
}

export interface DimensionComparison {
  dimension: SELDimension;
  pre: number;
  post: number;
  change: number;
}

export interface AssessmentComparisonResponse {
  status: ComparisonStatus;
  preAssessment?: {
    completionDate: string;
    scores: Record<SELDimension, number>;
  };
  postAssessment?: {
    completionDate: string;
    scores: Record<SELDimension, number>;
  };
  comparison?: DimensionComparison[];
}
