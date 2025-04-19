import React, { useEffect } from 'react';
import { useAssessment } from '@/hooks/useAssessment';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface AssessmentComparisonProps {
  onStartAssessment?: () => void;
}

const AssessmentComparison: React.FC<AssessmentComparisonProps> = ({
  onStartAssessment
}) => {
  const {
    comparisonData,
    comparisonLoading,
    assessmentStatus,
    fetchComparisonData
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

  if (comparisonData.status === 'POST_PENDING' && comparisonData.preAssessment) {
    const preData = comparisonData.preAssessment;
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
            <CardTitle>Pre-Assessment Results (Completed {format(new Date(preData.completionDate), 'MMMM d, yyyy')})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="dimension" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="pre" name="Pre-Assessment" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (comparisonData.status === 'AVAILABLE' && comparisonData.comparison) {
    const chartData = comparisonData.comparison.map(item => ({
      dimension: item.dimension.replace(/-/g, ' '),
      pre: item.pre,
      post: item.post,
    }));

    const preScores = Object.values(comparisonData.preAssessment!.scores);
    const postScores = Object.values(comparisonData.postAssessment!.scores);
    
    const preAverage = preScores.reduce((sum, score) => sum + score, 0) / preScores.length;
    const postAverage = postScores.reduce((sum, score) => sum + score, 0) / postScores.length;
    
    const overallChange = preAverage === 0 
      ? (postAverage > 0 ? 100 : 0)
      : Math.round(((postAverage - preAverage) / preAverage) * 100);

    const averagePre = Math.round(chartData.reduce((acc, item) => acc + item.pre, 0) / chartData.length);
    const averagePost = Math.round(chartData.reduce((acc, item) => acc + item.post, 0) / chartData.length);
    const averageChange = averagePost - averagePre;

    const growthData = chartData.map(item => ({
      dimension: item.dimension,
      change: item.post - item.pre,
      postScore: item.post
    }));

    const biggestGrowth = growthData.reduce((prev, current) => 
      (current.change > prev.change) ? current : prev
    );

    const strongestSkill = growthData.reduce((prev, current) => 
      (current.postScore > prev.postScore) ? current : prev
    );

    const weakestSkill = growthData.reduce((prev, current) => 
      (current.postScore < prev.postScore) ? current : prev
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-purple-700">Overall Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-32 h-32 rounded-full border-4 border-purple-200 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${overallChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {overallChange > 0 ? '+' : ''}{overallChange}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Change</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-purple-700">SEL Assessment Progress</CardTitle>
              <p className="text-sm text-gray-600">
                Comparing Pre-Assessment ({format(new Date(comparisonData.preAssessment!.completionDate), 'MMMM d, yyyy')}) with 
                Post-Assessment ({format(new Date(comparisonData.postAssessment!.completionDate), 'MMMM d, yyyy')})
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="dimension"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="pre" name="Pre-Assessment" fill="#8884d8" />
                    <Bar dataKey="post" name="Post-Assessment" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progress Summary</CardTitle>
            <p className="text-sm text-gray-600">Numeric comparison of your assessment scores</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">SEL Dimension</th>
                    <th className="text-center py-2">Pre Score</th>
                    <th className="text-center py-2">Post Score</th>
                    <th className="text-center py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item, index) => {
                    const change = item.post - item.pre;
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.dimension}</td>
                        <td className="text-center">{item.pre}%</td>
                        <td className="text-center">{item.post}%</td>
                        <td className={`text-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change > 0 ? '+' : ''}{change}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-medium">
                    <td className="py-2">Average</td>
                    <td className="text-center">{averagePre}%</td>
                    <td className="text-center">{averagePost}%</td>
                    <td className={`text-center ${averageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {averageChange > 0 ? '+' : ''}{averageChange}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Growth Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {biggestGrowth.change > 0 && (
              <div>
                <h3 className="text-purple-700 font-semibold mb-1">→ Biggest Growth Area</h3>
                <p className="text-gray-700">
                  {biggestGrowth.dimension}: Improved by +{biggestGrowth.change}%
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-purple-700 font-semibold mb-1">→ Strongest Skill</h3>
              <p className="text-gray-700">
                {strongestSkill.dimension} with a score of {strongestSkill.postScore}%
              </p>
            </div>

            <div>
              <h3 className="text-purple-700 font-semibold mb-1">→ Area for Continued Focus</h3>
              <p className="text-gray-700">
                {weakestSkill.dimension} currently at {weakestSkill.postScore}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Assessment Status</AlertTitle>
      <AlertDescription>
        {comparisonData.status === 'DISABLED' 
          ? "This feature is not currently available or is disabled."
          : "Unable to display assessment data. Please try again later."}
      </AlertDescription>
    </Alert>
  );
};

export default AssessmentComparison;
