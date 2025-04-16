
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAssessment } from '@/hooks/useAssessment';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { SELDimension } from '@/types/assessment';
import { sortByReference } from '@/utils/arrayUtils';

// Order of dimensions for display
const dimensionOrder: SELDimension[] = [
  'Self-Awareness',
  'Self-Management',
  'Social Awareness',
  'Relationship Skills',
  'Responsible Decision Making'
];

// Shorter labels for mobile
const getDimensionLabel = (dimension: SELDimension, isMobile: boolean): string => {
  if (!isMobile) return dimension;

  const shortLabels: Record<SELDimension, string> = {
    'Self-Awareness': 'Self-Aware',
    'Self-Management': 'Self-Manage',
    'Social Awareness': 'Social',
    'Relationship Skills': 'Relations',
    'Responsible Decision Making': 'Decisions'
  };

  return shortLabels[dimension] || dimension;
};

const AssessmentComparison: React.FC = () => {
  const { comparisonData, comparisonLoading, fetchComparisonData } = useAssessment();
  const isMobile = useIsMobile();

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
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Unable to load comparison data.</p>
        </CardContent>
      </Card>
    );
  }

  if (comparisonData.status === 'DISABLED') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            The assessment feature is currently disabled.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (comparisonData.status === 'PRE_PENDING') {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <p className="text-center text-gray-600 mb-4">
            You need to complete the Pre-Assessment before you can see comparison data.
          </p>
          <Button variant="outline" className="mt-2">Take Pre-Assessment</Button>
        </CardContent>
      </Card>
    );
  }

  if (comparisonData.status === 'POST_PENDING') {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <p className="text-center text-gray-600 mb-4">
            You've completed the Pre-Assessment on {
              comparisonData.preAssessment?.completionDate ? 
              format(parseISO(comparisonData.preAssessment.completionDate), 'MMMM d, yyyy') :
              '[date not available]'
            }.
            Complete the Post-Assessment to see your progress comparison.
          </p>
          <Button variant="outline" className="mt-2">Take Post-Assessment</Button>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = comparisonData.comparison ? 
    sortByReference(
      comparisonData.comparison.map(item => ({
        ...item,
        dimensionLabel: getDimensionLabel(item.dimension, isMobile)
      })),
      item => item.dimension,
      dimensionOrder
    ) : [];

  // Find the dimension with the biggest improvement
  const biggestImprovement = chartData.length > 0 ? 
    chartData.reduce((prev, current) => 
      (current.change > prev.change) ? current : prev
    ) : null;

  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const preDate = formatDate(comparisonData.preAssessment?.completionDate);
  const postDate = formatDate(comparisonData.postAssessment?.completionDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>SEL Assessment Progress</CardTitle>
              <CardDescription>
                Comparing Pre-Assessment ({preDate}) with Post-Assessment ({postDate})
              </CardDescription>
            </div>
            <TrendingUp className="h-8 w-8 text-sprout-green opacity-70" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                barGap={10}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dimensionLabel" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickCount={6}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  label={{ 
                    value: 'Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}/100`, '']}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.dimensionLabel === label);
                    return item?.dimension || label;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => value === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'} 
                />
                <ReferenceLine y={0} stroke="#000" />
                <Bar dataKey="pre" name="pre" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`pre-${index}`} fill="#8884d8" />
                  ))}
                </Bar>
                <Bar dataKey="post" name="post" fill="#82ca9d">
                  {chartData.map((entry, index) => (
                    <Cell key={`post-${index}`} fill="#82ca9d" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
          <CardDescription>Numeric comparison of your assessment scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">SEL Dimension</th>
                  <th className="text-center py-2 px-3">Pre Score</th>
                  <th className="text-center py-2 px-3">Post Score</th>
                  <th className="text-center py-2 px-3">Change</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">{item.dimension}</td>
                    <td className="text-center py-2 px-3">{item.pre}</td>
                    <td className="text-center py-2 px-3">{item.post}</td>
                    <td className={`text-center font-semibold py-2 px-3 ${item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : ''}`}>
                      {item.change > 0 ? `+${item.change}` : item.change}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="py-2 px-3 font-semibold">Average</td>
                  <td className="text-center py-2 px-3">
                    {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.pre, 0) / chartData.length) : 'N/A'}
                  </td>
                  <td className="text-center py-2 px-3">
                    {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.post, 0) / chartData.length) : 'N/A'}
                  </td>
                  <td className="text-center py-2 px-3 font-semibold">
                    {chartData.length > 0 ? 
                      (() => {
                        const avg = Math.round(chartData.reduce((sum, item) => sum + item.change, 0) / chartData.length);
                        return avg > 0 ? `+${avg}` : avg;
                      })() : 'N/A'
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      {biggestImprovement && (
        <Card className="bg-gradient-to-r from-sprout-green/5 to-sprout-purple/5 border-sprout-green/20">
          <CardHeader>
            <CardTitle className="text-sprout-green">Growth Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1 text-sprout-green" />
                  Biggest Growth Area
                </h4>
                <p className="ml-5">
                  <span className="font-medium">{biggestImprovement.dimension}</span>: Improved by <span className="font-semibold text-green-600">+{biggestImprovement.change} points</span>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1 text-sprout-green" />
                  Strongest Skill
                </h4>
                {(() => {
                  const strongest = chartData.reduce((prev, current) => 
                    (current.post > prev.post) ? current : prev
                  );
                  return (
                    <p className="ml-5">
                      <span className="font-medium">{strongest.dimension}</span> with a score of <span className="font-semibold">{strongest.post}/100</span>
                    </p>
                  );
                })()}
              </div>
              
              <div>
                <h4 className="font-semibold mb-1 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1 text-sprout-green" />
                  Area for Continued Focus
                </h4>
                {(() => {
                  const focus = chartData.reduce((prev, current) => 
                    (current.post < prev.post) ? current : prev
                  );
                  return (
                    <p className="ml-5">
                      <span className="font-medium">{focus.dimension}</span> currently at <span className="font-semibold">{focus.post}/100</span>
                    </p>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentComparison;
