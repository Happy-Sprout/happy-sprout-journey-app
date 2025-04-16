
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import AssessmentQuestion from "./AssessmentQuestion";
import NoActiveChildPrompt from "@/components/dashboard/NoActiveChildPrompt";
import { useAssessment } from '@/hooks/useAssessment';
import { useChildren } from '@/hooks/useChildren';
import { AssessmentAnswer, AssessmentQuestion as QuestionType, AssessmentType, SELDimension } from '@/types/assessment';
import { groupBy } from '@/utils/arrayUtils';

interface AssessmentFormProps {
  assessmentType: AssessmentType;
  onComplete?: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ 
  assessmentType,
  onComplete 
}) => {
  const { currentChildId } = useChildren();
  const { loading, questions, fetchQuestions, submitAssessment } = useAssessment();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Load questions when component mounts
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Group questions by dimension
  const questionsByDimension = groupBy(questions, (q: QuestionType) => q.dimension);
  
  // Update answer for a question
  const handleAnswerChange = (questionCode: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionCode]: value
    }));
  };
  
  // Check if all questions are answered
  useEffect(() => {
    const allAnswered = questions.length > 0 && 
      questions.every(q => answers[q.question_code] !== undefined);
    setIsValid(allAnswered);
  }, [answers, questions]);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid || !currentChildId) return;
    
    const formattedAnswers: AssessmentAnswer[] = Object.entries(answers).map(
      ([question_code, answer_value]) => ({ question_code, answer_value })
    );
    
    const resultId = await submitAssessment(assessmentType, formattedAnswers);
    
    if (resultId) {
      setSubmitted(true);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  if (!currentChildId) {
    return <NoActiveChildPrompt />;
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Assessment Completed!</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Thank you for completing the {assessmentType === 'PRE' ? 'Pre' : 'Post'} assessment. 
          Your answers help us better understand your social and emotional learning journey.
        </p>
        <Button onClick={onComplete} size="lg">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please answer all questions honestly. There are no right or wrong answers.
        </AlertDescription>
      </Alert>
      
      {Object.entries(questionsByDimension).map(([dimension, dimensionQuestions]) => (
        <div key={dimension} className="space-y-3">
          <h3 className="text-xl font-semibold text-sprout-purple">{dimension}</h3>
          <Separator className="bg-sprout-purple/30" />
          <div className="space-y-3 mt-3">
            {dimensionQuestions.map((question: QuestionType) => (
              <AssessmentQuestion
                key={question.question_code}
                question={question}
                value={answers[question.question_code] || 0}
                onChange={(value) => handleAnswerChange(question.question_code, value)}
              />
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSubmit} 
          disabled={!isValid || loading}
          size="lg"
          className="px-6"
        >
          {loading ? "Submitting..." : "Submit Assessment"}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentForm;
