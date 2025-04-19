import { format, startOfWeek, startOfMonth, isValid, addDays } from "date-fns";
import { EmotionalInsight, Period } from "@/types/emotionalInsights";

export const aggregateInsightsByPeriod = (data: EmotionalInsight[], period: Period) => {
  if (!data || data.length === 0) return [];
  
  // For weekly view, return daily values without aggregation
  if (period === 'weekly') {
    const weekStart = startOfWeek(new Date(data[0].created_at), { weekStartsOn: 1 });
    const dailyData: EmotionalInsight[] = [];
    
    // Create array of 7 days
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStart, i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Find insight for this day
      const dayInsight = data.find(insight => {
        const insightDate = new Date(insight.created_at);
        return format(insightDate, 'yyyy-MM-dd') === dateStr;
      });
      
      if (dayInsight) {
        dailyData.push({
          ...dayInsight,
          display_date: format(currentDate, 'EEE') // Mon, Tue, etc.
        });
      } else {
        // Add placeholder with null values for missing days
        dailyData.push({
          id: `empty-${dateStr}`,
          child_id: data[0].child_id,
          self_awareness: 0,
          self_management: 0,
          social_awareness: 0,
          relationship_skills: 0,
          responsible_decision_making: 0,
          created_at: currentDate.toISOString(),
          display_date: format(currentDate, 'EEE'),
          source_text: 'No data for this day'
        });
      }
    }

    return dailyData;
  }

  // For other periods (monthly/all), keep existing aggregation logic
  const groupedData: Record<string, EmotionalInsight[]> = {};
  
  data.forEach(insight => {
    const date = new Date(insight.created_at);
    
    if (!isValid(date)) {
      console.log("[useEmotionalInsights-DEBUG] Invalid date found:", insight.created_at);
      return;
    }
    
    let groupKey: string;
    
    if (period === 'monthly') {
      const monthStart = startOfMonth(date);
      groupKey = format(monthStart, 'yyyy-MM');
    } else {
      groupKey = format(date, 'yyyy-MM-dd');
    }
    
    if (!groupedData[groupKey]) {
      groupedData[groupKey] = [];
    }
    
    groupedData[groupKey].push(insight);
  });
  
  const result = Object.entries(groupedData).map(([dateKey, insights]) => {
    const avgSelfAwareness = insights.reduce((sum, insight) => sum + insight.self_awareness, 0) / insights.length;
    const avgSelfManagement = insights.reduce((sum, insight) => sum + insight.self_management, 0) / insights.length;
    const avgSocialAwareness = insights.reduce((sum, insight) => sum + insight.social_awareness, 0) / insights.length;
    const avgRelationshipSkills = insights.reduce((sum, insight) => sum + insight.relationship_skills, 0) / insights.length;
    const avgResponsibleDecisionMaking = insights.reduce((sum, insight) => sum + insight.responsible_decision_making, 0) / insights.length;
    
    const sortedByDate = [...insights].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const mostRecentInsight = sortedByDate[0];
    
    return {
      id: `aggregated-${dateKey}`,
      child_id: mostRecentInsight.child_id,
      self_awareness: avgSelfAwareness,
      self_management: avgSelfManagement,
      social_awareness: avgSocialAwareness,
      relationship_skills: avgRelationshipSkills,
      responsible_decision_making: avgResponsibleDecisionMaking,
      created_at: mostRecentInsight.created_at,
      display_date: dateKey,
      source_text: mostRecentInsight.source_text || 'Aggregated data'
    };
  }).sort((a, b) => 
    new Date(a.display_date || a.created_at).getTime() - new Date(b.display_date || b.created_at).getTime()
  );
  
  console.log("[useEmotionalInsights-DEBUG] Aggregated results:", result);
  return result;
};
