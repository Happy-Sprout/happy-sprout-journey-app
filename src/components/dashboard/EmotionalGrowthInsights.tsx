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
import { format, parseISO, isValid } from "date-fns";
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
import { useIsMobile } from "@/hooks/use-mobile";

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

const SEL_LABELS_MOBILE = {
  self_awareness: "Awareness 🌱",
  self_management: "Management 💪",
  social_awareness: "Social 🤝",
  relationship_skills: "Relations 💬",
  responsible_decision_making: "Decisions 🧠"
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
  const [selectedTab, setSelectedTab] = useState("compare");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");
  const isDevelopment = import.meta.env.DEV;
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const previousDataFetchedRef = useRef<boolean>(false);
  const isMobile = useIsMobile();
  
  useLayoutEffect(() => {
    if (chartContainerRef.current) {
      const updateSize = () => {
        if (chartContainerRef.current) {
          setChartWidth(chartContainerRef.current.clientWidth);
          const minHeight = isMobile ? 380 : 300;
          setChartHeight(Math.max(chartContainerRef.current.clientHeight, minHeight));
        }
      };
      
      updateSize();
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(chartContainerRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [isMobile]);

  const fetchHistoricalData = useCallback(async () => {
    if (selectedTab !== "compare" && !previousDataFetchedRef.current) {
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

  useEffect(() => {
    if (selectedTab !== "compare") {
      previousDataFetchedRef.current = false;
      fetchHistoricalData();
    }
  }, [selectedTab, selectedPeriod, fetchHistoricalData]);

  const radarChartData = useMemo(() => {
    if (!insight) return [];
    
    const labels = isMobile ? SEL_LABELS_MOBILE : SEL_LABELS;
    
    return [
      {
        subject: labels.self_awareness,
        A: insight.self_awareness * 100,
        fullMark: 100,
        key: "self_awareness"
      },
      {
        subject: labels.self_management,
        A: insight.self_management * 100,
        fullMark: 100,
        key: "self_management"
      },
      {
        subject: labels.social_awareness,
        A: insight.social_awareness * 100,
        fullMark: 100,
        key: "social_awareness"
      },
      {
        subject: labels.relationship_skills,
        A: insight.relationship_skills * 100,
        fullMark: 100,
        key: "relationship_skills"
      },
      {
        subject: labels.responsible_decision_making,
        A: insight.responsible_decision_making * 100,
        fullMark: 100,
        key: "responsible_decision_making"
      }
    ];
  }, [insight, isMobile]);

  const formatDateForPeriod = (dateStr: string, period: Period) => {
    if (!dateStr || !isValid(new Date(dateStr))) return '';
    
    try {
      let date;
      
      if (typeof dateStr === 'string') {
        date = parseISO(dateStr);
      } else {
        date = new Date(dateStr);
      }
      
      if (!isValid(date)) return 'Invalid Date';
      
      switch (period) {
        case 'weekly':
          return format(date, 'MMM d');
        case 'monthly':
          return format(date, 'MMM yyyy');
        default:
          return format(date, 'MMM d');
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid Date';
    }
  };

  const lineChartData = useMemo(() => {
    if (!historicalInsights || historicalInsights.length === 0) return [];
    
    return historicalInsights.map(insight => {
      const date = insight.display_date || insight.created_at;
      const formattedDate = formatDateForPeriod(date, selectedPeriod);
      
      return {
        date: formattedDate,
        self_awareness: Number((insight.self_awareness * 100).toFixed(1)),
        self_management: Number((insight.self_management * 100).toFixed(1)),
        social_awareness: Number((insight.social_awareness * 100).toFixed(1)),
        relationship_skills: Number((insight.relationship_skills * 100).toFixed(1)),
        responsible_decision_making: Number((insight.responsible_decision_making * 100).toFixed(1)),
        raw_date: insight.created_at,
        dateKey: date
      };
    });
  }, [historicalInsights, selectedPeriod]);

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
      compare: `${currentChild.nickname}'s emotional insights will appear here after completing journal entries or daily check-ins.`,
      trends: `Keep tracking ${currentChild.nickname}'s feelings! Growth trends will appear here after a few entries.`
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                  <HoverCardContent className="w-80 p-4 z-50">
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
          <TabsList className="mb-4 w-full flex flex-wrap sm:grid sm:grid-cols-2 gap-1">
            <TabsTrigger value="compare" className="flex-1 text-xs sm:text-sm px-2 py-1.5 whitespace-normal h-auto min-h-[2.5rem]">Compare Areas</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1 text-xs sm:text-sm px-2 py-1.5 whitespace-normal h-auto min-h-[2.5rem]">Growth Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compare">
            {insight ? (
              <>
                <div 
                  className="w-full h-64 sm:h-72" 
                  ref={chartContainerRef}
                >
                  <ResponsiveContainer width="100%" height="100%" minHeight={isMobile ? 380 : 300}>
                    <RadarChart 
                      outerRadius={isMobile ? "65%" : "80%"} 
                      data={radarChartData}
                      margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                    >
                      <PolarGrid />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fontSize: isMobile ? 9 : 12 }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tickCount={5}
                        tick={{ fontSize: isMobile ? 9 : 10 }}
                      />
                      <Radar 
                        name="Skill Level" 
                        dataKey="A" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, "Skill Level"]}
                        wrapperStyle={{ zIndex: 100 }} 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          fontSize: isMobile ? '10px' : '12px',
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {getGrowthFeedback}
              </>
            ) : (
              renderNoDataMessage("compare")
            )}
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center mb-3">
              <div className="text-sm font-medium text-slate-700">View period:</div>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedPeriod === "weekly" ? "default" : "outline"} 
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedPeriod("weekly")}
                >
                  Weekly
                </Badge>
                <Badge 
                  variant={selectedPeriod === "monthly" ? "default" : "outline"} 
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedPeriod("monthly")}
                >
                  Monthly
                </Badge>
                <Badge 
                  variant={selectedPeriod === "all" ? "default" : "outline"} 
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedPeriod("all")}
                >
                  All Time
                </Badge>
              </div>
            </div>
            
            {historicalLoading ? (
              <div className="w-full h-64 animate-pulse bg-gray-100 rounded"></div>
            ) : lineChartData.length >= 2 ? (
              <div className="w-full h-72 sm:h-80" ref={chartContainerRef}>
                <ResponsiveContainer width="100%" height="100%" minHeight={isMobile ? 380 : 300}>
                  <LineChart
                    data={lineChartData}
                    margin={isMobile ? 
                      { top: 5, right: 5, left: 0, bottom: 95 } : 
                      { top: 5, right: 20, left: 0, bottom: 40 }
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: isMobile ? 9 : 10 }}
                      height={isMobile ? 45 : 30}
                      padding={{ left: 10, right: 10 }}
                      tickMargin={isMobile ? 12 : 5}
                      interval={isMobile ? 'preserveEnd' : 0}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: isMobile ? 9 : 10 }}
                      width={isMobile ? 30 : 40}
                      tickMargin={isMobile ? 3 : 5}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        const readableName = name === 'self_awareness' ? 'Self-Awareness' :
                                            name === 'self_management' ? 'Self-Management' :
                                            name === 'social_awareness' ? 'Social Awareness' :
                                            name === 'relationship_skills' ? 'Relationship Skills' :
                                            name === 'responsible_decision_making' ? 'Decision-Making' : name;
                        return [`${value}%`, readableName];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0 && payload[0].payload) {
                          const rawDate = payload[0].payload.raw_date;
                          return rawDate ? format(new Date(rawDate), 'MMM d, yyyy') : label;
                        }
                        return label;
                      }}
                      contentStyle={{ 
                        fontSize: '12px',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      position={isMobile ? { x: 5, y: 75 } : undefined}
                      wrapperStyle={{ zIndex: 100 }}
                      coordinate={{ x: 100, y: 100 }}
                    />
                    <Legend 
                      height={isMobile ? 80 : 36}
                      iconSize={isMobile ? 6 : 8} 
                      iconType="circle"
                      wrapperStyle={{ 
                        fontSize: isMobile ? '8px' : '10px', 
                        paddingTop: '10px',
                        width: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '5px',
                        bottom: 0
                      }}
                      layout={isMobile ? "vertical" : "horizontal"}
                      margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
                      align="center"
                      verticalAlign="bottom"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="self_awareness" 
                      name="Self-Awareness" 
                      stroke={SEL_COLORS.self_awareness} 
                      activeDot={{ r: isMobile ? 6 : 8 }} 
                      dot={{ r: isMobile ? 2 : 3 }}
                      strokeWidth={isMobile ? 1.5 : 2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="self_management" 
                      name="Self-Management" 
                      stroke={SEL_COLORS.self_management}
                      dot={{ r: isMobile ? 2 : 3 }}
                      strokeWidth={isMobile ? 1.5 : 2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="social_awareness" 
                      name="Social Awareness" 
                      stroke={SEL_COLORS.social_awareness}
                      dot={{ r: isMobile ? 2 : 3 }}
                      strokeWidth={isMobile ? 1.5 : 2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="relationship_skills" 
                      name="Relationship Skills" 
                      stroke={SEL_COLORS.relationship_skills}
                      dot={{ r: isMobile ? 2 : 3 }}
                      strokeWidth={isMobile ? 1.5 : 2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responsible_decision_making" 
                      name="Decision-Making" 
                      stroke={SEL_COLORS.responsible_decision_making}
                      dot={{ r: isMobile ? 2 : 3 }}
                      strokeWidth={isMobile ? 1.5 : 2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              renderNoDataMessage("trends")
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmotionalGrowthInsights;
