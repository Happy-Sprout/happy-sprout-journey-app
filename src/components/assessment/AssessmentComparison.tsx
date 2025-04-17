
import React, { useEffect } from 'react';
import { useAssessment } from '@/hooks/useAssessment';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { format } from 'date-fns';

interface AssessmentComparisonProps {
  onStartAssessment?: () => void;
}

const AssessmentComparison: React.FC<AssessmentComparisonProps> = ({ 
  onStartAssessment
}) => {
  const { 
    comparisonData, 
    comparisonLoading, 
    fetchComparisonData,
    assessmentStatus 
  } = useAssessment();
  
  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);
  
  if (comparisonLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sprout-purple"></div>
      </div>
    );
  }
  
  if (!comparisonData) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No assessment data available.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show message if pre-assessment not taken yet
  if (comparisonData.status === 'PRE_PENDING') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <Alert variant="default" className="max-w-lg">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-base">
            You need to complete the Pre-Assessment before you can see comparison data.
          </AlertDescription>
        </Alert>
        
        {onStartAssessment && (
          <Button 
            onClick={onStartAssessment} 
            className="mt-4"
          >
            Take Pre-Assessment
          </Button>
        )}
      </div>
    );
  }
  
  // Show only pre-assessment results if post-assessment not taken yet
  if (comparisonData.status === 'POST_PENDING' && comparisonData.preAssessment) {
    const preData = comparisonData.preAssessment;
    const preDate = format(new Date(preData.completionDate), 'MMM d, yyyy');
    const chartData = Object.entries(preData.scores).map(([dimension, score]) => ({
      dimension: dimension.replace(/([A-Z])/g, ' $1').trim(),
      pre: score,
    }));
    
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have completed the Pre-Assessment. Complete the Post-Assessment to see your growth comparison.
          </AlertDescription>
        </Alert>
        
        {onStartAssessment && (
          <div className="flex justify-center">
            <Button 
              onClick={onStartAssessment} 
              className="mb-6"
            >
              Take Post-Assessment
            </Button>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Pre-Assessment Results (Completed {preDate})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimension" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pre" name="Pre-Assessment" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show comparison if both assessments are completed
  if (comparisonData.status === 'AVAILABLE' && comparisonData.comparison) {
    const { preAssessment, postAssessment, comparison } = comparisonData;
    const preDate = format(new Date(preAssessment!.completionDate), 'MMM d, yyyy');
    const postDate = format(new Date(postAssessment!.completionDate), 'MMM d, yyyy');
    
    const chartData = comparison.map(item => ({
      dimension: item.dimension.replace(/([A-Z])/g, ' $1').trim(),
      pre: item.pre,
      post: item.post,
      change: item.change
    }));
    
    // Calculate overall improvement percentage
    const totalPreScore = comparison.reduce((sum, item) => sum + item.pre, 0);
    const totalPostScore = comparison.reduce((sum, item) => sum + item.post, 0);
    const dimensions = comparison.length;
    const averagePreScore = totalPreScore / dimensions;
    const averagePostScore = totalPostScore / dimensions;
    const overallImprovement = Math.round(((averagePostScore - averagePreScore) / averagePreScore) * 100);
    
    return (
      <div className="space-y-6">
        <Card className="bg-sprout-green/5 border-sprout-green/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <div>
                <h3 className="text-xl font-semibold text-sprout-green">Assessment Comparison Complete</h3>
                <p className="text-gray-600">
                  Pre-Assessment: {preDate} | Post-Assessment: {postDate}
                </p>
              </div>
              <div className="bg-white rounded-full p-4 border border-sprout-green/20">
                <p className="text-sm text-gray-500">Overall Change</p>
                <p className={`text-2xl font-bold ${overallImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallImprovement > 0 ? '+' : ''}{overallImprovement}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>SEL Skills Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimension" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pre" name="Pre-Assessment" fill="#9333ea" />
                  <Bar dataKey="post" name="Post-Assessment" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills Growth Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparison.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{item.dimension.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      item.change > 0 
                        ? 'bg-green-100 text-green-700' 
                        : item.change < 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-sprout-purple h-2.5 rounded-full" 
                      style={{ width: `${item.pre}%` }}
                    />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-sprout-green h-2.5 rounded-full" 
                      style={{ width: `${item.post}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Pre: {item.pre}%</span>
                    <span>Post: {item.post}%</span>
                  </div>
                  {index < comparison.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // For disabled feature or other unexpected states
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        This feature is not currently available or is disabled.
      </AlertDescription>
    </Alert>
  );
};

export default AssessmentComparison;
