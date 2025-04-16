
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type EmotionData = {
  date: string;
  rawDate?: string; // Added for unique identification in tooltips
  mood: number;
  anxiety?: number;
  focus?: number;
  energy?: number;
};

interface EmotionalTrendsChartProps {
  data: EmotionData[];
  title?: string;
  description?: string;
  height?: number;
  showMood?: boolean;
  showAnxiety?: boolean;
  showFocus?: boolean;
  showEnergy?: boolean;
}

const EmotionalTrendsChart = ({
  data,
  title = "Emotional Trends",
  description = "Track emotional state over time",
  height = 300,
  showMood = true,
  showAnxiety = true,
  showFocus = true,
  showEnergy = true,
}: EmotionalTrendsChartProps) => {
  // We don't need to format dates here anymore as they should come pre-formatted
  // Just ensure the data is sorted by date
  const formattedData = useMemo(() => 
    data.slice().sort((a, b) => {
      // Use rawDate for sorting if available, otherwise use the formatted date
      const dateA = a.rawDate ? new Date(a.rawDate) : new Date(a.date);
      const dateB = b.rawDate ? new Date(b.rawDate) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    }), 
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              // Ensure we don't show duplicate dates by using appropriate intervals
              interval="preserveEnd"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={[0, 10]} 
              // Ensure Y-axis shows numeric values only
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              // Use rawDate in tooltip label if available for more precise information
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0 && payload[0].payload && payload[0].payload.rawDate) {
                  return `Date: ${payload[0].payload.rawDate}`;
                }
                return `Date: ${label}`;
              }}
            />
            <Legend />
            {showMood && (
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#22c55e" 
                name="Mood" 
                activeDot={{ r: 8 }} 
              />
            )}
            {showAnxiety && (
              <Line 
                type="monotone" 
                dataKey="anxiety" 
                stroke="#ef4444" 
                name="Anxiety" 
              />
            )}
            {showFocus && (
              <Line 
                type="monotone" 
                dataKey="focus" 
                stroke="#3b82f6" 
                name="Focus" 
              />
            )}
            {showEnergy && (
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#f59e0b" 
                name="Energy" 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EmotionalTrendsChart;
