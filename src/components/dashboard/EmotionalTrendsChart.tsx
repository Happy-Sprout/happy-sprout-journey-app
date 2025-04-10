
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type EmotionData = {
  date: string;
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
  // Format dates for better display
  const formattedData = useMemo(() => 
    data.map(entry => ({
      ...entry,
      date: new Date(entry.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    })), 
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
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
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
