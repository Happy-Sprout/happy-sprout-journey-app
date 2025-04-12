
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { format } from "date-fns";
import { Brain, Heart, Users, MessageCircle, Lightbulb } from "lucide-react";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { EmotionalInsight } from "@/hooks/useEmotionalInsights";
import { ChildProfile } from "@/hooks/useChildren";

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

interface EmotionalGrowthInsightsProps {
  currentChild: ChildProfile;
  insight: EmotionalInsight | null;
  loading?: boolean;
}

const EmotionalGrowthInsights = ({ 
  currentChild, 
  insight, 
  loading = false 
}: EmotionalGrowthInsightsProps) => {
  const chartData = useMemo(() => {
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

  const getGrowthFeedback = () => {
    if (!insight) return null;
    
    // Find the highest and lowest skill areas
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
  };

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
        {insight ? (
          <>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={chartData}>
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
            {getGrowthFeedback()}
          </>
        ) : (
          <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
            <p className="text-slate-500 text-center mb-2">
              No emotional growth data available yet
            </p>
            <p className="text-sm text-slate-400 text-center max-w-sm">
              Complete journal entries and daily check-ins to see insights about emotional growth
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionalGrowthInsights;
