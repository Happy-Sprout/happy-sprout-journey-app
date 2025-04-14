
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { Brain, Heart, Users, MessageCircle, Lightbulb, AlertTriangle, BookOpen, DatabaseIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { EmotionalInsight, Period } from "@/hooks/useEmotionalInsights";
import { ChildProfile } from "@/hooks/useChildren";
import { Badge } from "@/components/ui/badge";
import { useLayoutEffect } from "react";

const SEL_DESCRIPTIONS = {
  self_awareness: "Understanding one's emotions, personal goals, and values.",
  self_management: "Regulating emotions and behaviors to achieve goals.",
  social_awareness: "Showing understanding and empathy for others.",
  relationship_skills: "Forming positive relationships, teamwork, conflict resolution.",
  responsible_decision_making: "Making ethical, constructive choices."
};

const SEL_ICONS = {
  self_awareness: <Brain className="w-4 h-4" />,
  self_management: <Heart className="w-4 h-4" />,
  social_awareness: <Users className="w-4 h-4" />,
  relationship_skills: <MessageCircle className="w-4 h-4" />,
  responsible_decision_making: <Lightbulb className="w-4 h-4" />
};

const SEL_LABELS = {
  self_awareness: "Self-Awareness 🌱",
  self_management: "Self-Management 💪",
  social_awareness: "Social Awareness 🤝",
  relationship_skills: "Relationship Skills 💬",
  responsible_decision_making: "Decision-Making 🧠"
};

const SEL_COLORS = {
  self_awareness: "#8884d8",
  self_management: "#82ca9d",
  social_awareness: "#ffc658",
  relationship_skills: "#ff8042",
  responsible_decision_making: "#0088fe"
};

interface EmotionalGrowthInsightsProps {
  currentChild: ChildProfile;
  insight: EmotionalInsight | null;
  loading?: boolean;
  fetchHistoricalInsights: (period: Period) => Promise<void>;
  historicalInsights: EmotionalInsight[];
  historicalLoading: boolean;
  isFallbackData?: boolean;
  hasInsufficientData?: boolean;
}

const EmotionalGrowthInsights = ({ 
  currentChild, 
  insight, 
  loading = false,
  fetchHistoricalInsights,
  historicalInsights,
  historicalLoading = false,
  isFallbackData = false,
  hasInsufficientData = false
}: EmotionalGrowthInsightsProps) => {
  const [selectedTab, setSelectedTab] = useState("latest");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");
  const isDevelopment = import.meta.env.DEV;
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const previousDataFetchedRef = useRef<boolean>(false);

  // Set chart dimensions based on container size
  useLayoutEffect(() => {
    if (chartContainerRef.current) {
      const updateSize = () => {
        if (chartContainerRef.current) {
          setChartWidth(chartContainerRef.current.clientWidth);
          setChartHeight(Math.max(chartContainerRef.current.clientHeight, 300));
        }
      };
      
      updateSize();
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(chartContainerRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, []);

  const fetchHistoricalData = useCallback(async () => {
    if (selectedTab !== "latest" && !previousDataFetchedRef.current) {
      try {
        await fetchHistoricalInsights(selectedPeriod);
        setConnectionError(false);
        previousDataFetchedRef.current = true;
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setConnectionError(true);
      }
    }
  }, [selectedTab, selectedPeriod, fetchHistoricalInsights]);

  // Only fetch data when tab or period changes, not on every render
  useEffect(() => {
    if (selectedTab !== "latest") {
      previousDataFetchedRef.current = false;
      fetchHistoricalData();
    }
  }, [selectedTab, selectedPeriod, fetchHistoricalData]);

  const radarChartData = useMemo(() => {
    if (!insight) return [];
    
    return [
      {
        subject: SEL_LABELS.self_awareness,
        A: insight.self_awareness * 100,
        fullMark: 100,
        key: "self_awareness"
      },
      {
        subject: SEL_LABELS.self_management,
        A: insight.self_management * 100,
        fullMark: 100,
        key: "self_management"
      },
      {
        subject: SEL_LABELS.social_awareness,
        A: insight.social_awareness * 100,
        fullMark: 100,
        key: "social_awareness"
      },
      {
        subject: SEL_LABELS.relationship_skills,
        A: insight.relationship_skills * 100,
        fullMark: 100,
        key: "relationship_skills"
      },
      {
        subject: SEL_LABELS.responsible_decision_making,
        A: insight.responsible_decision_making * 100,
        fullMark: 100,
        key: "responsible_decision_making"
      }
    ];
  }, [insight]);

  const lineChartData = useMemo(() => {
    if (!historicalInsights || historicalInsights.length === 0) return [];
    
    // Sort chronologically once, not in the render cycle
    const sortedInsights = [...historicalInsights].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return sortedInsights.map(insight => ({
      date: format(parseISO(insight.created_at), "MMM d"),
      self_awareness: Number((insight.self_awareness * 100).toFixed(1)),
      self_management: Number((insight.self_management * 100).toFixed(1)),
      social_awareness: Number((insight.social_awareness * 100).toFixed(1)),
      relationship_skills: Number((insight.relationship_skills * 100).toFixed(1)),
      responsible_decision_making: Number((insight.responsible_decision_making * 100).toFixed(1)),
      raw_date: insight.created_at,
    }));
  }, [historicalInsights]);

  const getGrowthFeedback = useMemo(() => {
    if (!insight) return null;
    
    const skills = [
      { name: 'self_awareness', value: insight.self_awareness },
      { name: 'self_management', value: insight.self_management },
      { name: 'social_awareness', value: insight.social_awareness },
      { name: 'relationship_skills', value: insight.relationship_skills },
      { name: 'responsible_decision_making', value: insight.responsible_decision_making }
    ];
    
    const highestSkill = skills.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    );
    
    const lowestSkill = skills.reduce((prev, current) => 
      (prev.value < current.value) ? prev : current
    );
    
    return (
      <div className="mt-4 p-3 bg-slate-50 rounded-md">
        <p className="text-sm text-slate-800">
          <span className="font-semibold">Growing strength:</span> {SEL_LABELS[highestSkill.name as keyof typeof SEL_LABELS]} 
          {' '}- {(highestSkill.value * 100).toFixed(0)}%
        </p>
        <p className="text-sm text-slate-800 mt-1">
          <span className="font-semibold">Growth opportunity:</span> {SEL_LABELS[lowestSkill.name as keyof typeof SEL_LABELS]}
          {' '}- {(lowestSkill.value * 100).toFixed(0)}%
        </p>
      </div>
    );
  }, [insight]);

  const renderNoDataMessage = useCallback((type: string) => {
    const messages = {
      latest: `${currentChild.nickname}'s emotional insights will appear here after completing journal entries or daily check-ins.`,
      trends: `Keep tracking ${currentChild.nickname}'s feelings! Growth trends will appear here after a few entries.`,
      compare: `Not enough data yet to compare emotional skills. Complete more journal entries or check-ins.`
    };
    
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg p-6">
        <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-600 text-center font-medium mb-2">
          Start your SEL journey!
        </p>
        <p className="text-sm text-slate-500 text-center max-w-md">
          {messages[type as keyof typeof messages]}
        </p>
      </div>
    );
  }, [currentChild.nickname]);

  if (loading) {
    return (
      <Card className="w-full mb-8 animate-pulse">
        <CardHeader>
          <CardTitle className="bg-gray-200 h-6 w-48 rounded"></CardTitle>
          <CardDescription className="bg-gray-100 h-4 w-64 rounded"></CardDescription>
        </CardHeader>
        <CardContent className="h-64 bg-gray-50 rounded"></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-8 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Emotional Growth Insights</CardTitle>
            <CardDescription>
              {insight 
                ? `Last updated: ${format(new Date(insight.created_at), "MMMM d, yyyy")}`
                : "No insights available yet - complete a journal entry or daily check-in"}
            </CardDescription>
          </div>
          
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="text-blue-500 text-sm font-semibold hover:underline">
                      What is this?
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Emotional Growth Insights</h4>
                      <p className="text-sm">
                        This chart shows {currentChild.nickname}'s emotional growth based on their journal entries and check-ins.
                        Each axis represents a key social-emotional learning skill.
                      </p>
                      <div className="space-y-1 pt-2">
                        {Object.entries(SEL_DESCRIPTIONS).map(([key, desc]) => (
                          <div key={key} className="flex items-start gap-2">
                            <div className="mt-0.5">{SEL_ICONS[key as keyof typeof SEL_ICONS]}</div>
                            <div>
                              <p className="text-xs font-medium">{SEL_LABELS[key as keyof typeof SEL_LABELS]}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TooltipTrigger>
              <TooltipContent>Click for more information</TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        {(isFallbackData && isDevelopment) && (
          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              Using example data for development. Connect to the database to see actual insights.
            </AlertDescription>
          </Alert>
        )}
        
        {connectionError && (
          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
            <DatabaseIcon className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              Failed to fetch emotional growth insights. Using sample data for development.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4 w-full grid grid-cols-3">
            <TabsTrigger value="latest">Latest Snapshot</TabsTrigger>
            <TabsTrigger value="trends">Growth Trends</TabsTrigger>
            <TabsTrigger value="compare">Compare Areas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="latest">
            {insight ? (
              <>
                <div 
                  className="w-full h-64" 
                  ref={chartContainerRef}
                >
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <RadarChart outerRadius="80%" data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tickCount={5}
                        tick={{ fontSize: 10 }}
                      />
                      <Radar 
                        name="Skill Level" 
                        dataKey="A" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip formatter={(value) => [`${value}%`, "Skill Level"]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {getGrowthFeedback}
              </>
            ) : (
              renderNoDataMessage("latest")
            )}
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-slate-700">View period:</div>
              <div className="flex space-x-2">
                <Badge 
                  variant={selectedPeriod === "weekly" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod("weekly")}
                >
                  Weekly
                </Badge>
                <Badge 
                  variant={selectedPeriod === "monthly" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod("monthly")}
                >
                  Monthly
                </Badge>
                <Badge 
                  variant={selectedPeriod === "all" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod("all")}
                >
                  All Time
                </Badge>
              </div>
            </div>
            
            {historicalLoading ? (
              <div className="w-full h-64 animate-pulse bg-gray-100 rounded"></div>
            ) : lineChartData.length >= 2 ? (
              <div className="w-full h-64" ref={chartContainerRef}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <LineChart
                    data={lineChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      height={30}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10 }}
                      width={40}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend 
                      height={36}
                      iconSize={8} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="self_awareness" 
                      name="Self-Awareness" 
                      stroke={SEL_COLORS.self_awareness} 
                      activeDot={{ r: 8 }} 
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="self_management" 
                      name="Self-Management" 
                      stroke={SEL_COLORS.self_management}
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="social_awareness" 
                      name="Social Awareness" 
                      stroke={SEL_COLORS.social_awareness}
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="relationship_skills" 
                      name="Relationship Skills" 
                      stroke={SEL_COLORS.relationship_skills}
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responsible_decision_making" 
                      name="Decision-Making" 
                      stroke={SEL_COLORS.responsible_decision_making}
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              renderNoDataMessage("trends")
            )}
          </TabsContent>
          
          <TabsContent value="compare">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-slate-700">View period:</div>
              <div className="flex space-x-2">
                <Badge 
                  variant={selectedPeriod === "weekly" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod("weekly")}
                >
                  Weekly
                </Badge>
                <Badge 
                  variant={selectedPeriod === "monthly" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod("monthly")}
                >
                  Monthly
                </Badge>
                <Badge 
                  variant={selectedPeriod === "all" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod("all")}
                >
                  All Time
                </Badge>
              </div>
            </div>
            
            {historicalLoading ? (
              <div className="w-full h-64 animate-pulse bg-gray-100 rounded"></div>
            ) : lineChartData.length >= 2 ? (
              <div className="w-full h-64" ref={chartContainerRef}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <LineChart
                    data={lineChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => {
                        let displayName = name;
                        if (name === "self_awareness") displayName = "Self-Awareness";
                        if (name === "self_management") displayName = "Self-Management";
                        if (name === "social_awareness") displayName = "Social Awareness";
                        if (name === "relationship_skills") displayName = "Relationship Skills";
                        if (name === "responsible_decision_making") displayName = "Decision-Making";
                        return [`${value}%`, displayName];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="self_awareness" 
                      name="Self-Awareness" 
                      stroke={SEL_COLORS.self_awareness} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="self_management" 
                      name="Self-Management" 
                      stroke={SEL_COLORS.self_management} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="social_awareness" 
                      name="Social Awareness" 
                      stroke={SEL_COLORS.social_awareness}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="relationship_skills" 
                      name="Relationship Skills" 
                      stroke={SEL_COLORS.relationship_skills}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responsible_decision_making" 
                      name="Decision-Making" 
                      stroke={SEL_COLORS.responsible_decision_making}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              renderNoDataMessage("compare")
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmotionalGrowthInsights;
