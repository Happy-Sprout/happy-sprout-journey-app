
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AssessmentQuestion as QuestionType } from '@/types/assessment';

interface AssessmentQuestionProps {
  question: QuestionType;
  value: number;
  onChange: (value: number) => void;
}

const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <p className="mb-4 font-medium text-lg">{question.question_text}</p>
        
        <RadioGroup 
          value={value.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
          className="grid grid-cols-5 gap-4 sm:gap-6"
        >
          <div className="flex flex-col items-center">
            <RadioGroupItem value="5" id={`${question.question_code}-5`} />
            <Label htmlFor={`${question.question_code}-5`} className="mt-2 text-center">
              Strongly<br/>Agree<br/>
              <span className="text-lg font-semibold">5</span>
            </Label>
          </div>
          
          <div className="flex flex-col items-center">
            <RadioGroupItem value="4" id={`${question.question_code}-4`} />
            <Label htmlFor={`${question.question_code}-4`} className="mt-2 text-center">
              Agree<br/>
              <span className="text-lg font-semibold">4</span>
            </Label>
          </div>
          
          <div className="flex flex-col items-center">
            <RadioGroupItem value="3" id={`${question.question_code}-3`} />
            <Label htmlFor={`${question.question_code}-3`} className="mt-2 text-center">
              Sometimes<br/>
              <span className="text-lg font-semibold">3</span>
            </Label>
          </div>
          
          <div className="flex flex-col items-center">
            <RadioGroupItem value="2" id={`${question.question_code}-2`} />
            <Label htmlFor={`${question.question_code}-2`} className="mt-2 text-center">
              Disagree<br/>
              <span className="text-lg font-semibold">2</span>
            </Label>
          </div>
          
          <div className="flex flex-col items-center">
            <RadioGroupItem value="1" id={`${question.question_code}-1`} />
            <Label htmlFor={`${question.question_code}-1`} className="mt-2 text-center">
              Strongly<br/>Disagree<br/>
              <span className="text-lg font-semibold">1</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AssessmentQuestion;
