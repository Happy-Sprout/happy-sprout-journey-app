import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isAfter } from "date-fns";
import { EmotionalInsight, Period } from "@/types/emotionalInsights";

export const generateSampleHistoricalData = (period: Period, childId: string, startDate?: Date): EmotionalInsight[] => {
  const weekStart = startDate || startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const sampleData: EmotionalInsight[] = [];
  const currentDate = new Date();
  
  if (period === 'weekly') {
    for (let i = 0; i < 7; i++) {
      if (i % 2 === 0 || i === 6) {
        const date = addDays(weekStart, i);
        
        if (!isAfter(date, currentDate)) {
          const dayProgress = i / 6;
          const samplePoint: EmotionalInsight = {
            id: `sample-daily-${i}`,
            child_id: childId,
            self_awareness: 0.4 + (0.4 * dayProgress) + (Math.random() * 0.1),
            self_management: 0.45 + (0.35 * dayProgress) + (Math.random() * 0.1),
            social_awareness: 0.5 + (0.3 * dayProgress) + (Math.random() * 0.1),
            relationship_skills: 0.4 + (0.35 * dayProgress) + (Math.random() * 0.1),
            responsible_decision_making: 0.45 + (0.4 * dayProgress) + (Math.random() * 0.1),
            created_at: date.toISOString(),
            display_date: format(date, 'yyyy-MM-dd'),
            source_text: `Sample data for ${format(date, 'yyyy-MM-dd')}`
          };
          
          sampleData.push(samplePoint);
        }
      }
    }
  } else {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(monthStart);
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(monthStart, i);
      
      if (!isAfter(date, currentDate)) {
        const dayProgress = i / 30;
        const samplePoint: EmotionalInsight = {
          id: `sample-daily-${i}`,
          child_id: childId,
          self_awareness: 0.4 + (0.4 * dayProgress) + (Math.random() * 0.1),
          self_management: 0.45 + (0.35 * dayProgress) + (Math.random() * 0.1),
          social_awareness: 0.5 + (0.3 * dayProgress) + (Math.random() * 0.1),
          relationship_skills: 0.4 + (0.35 * dayProgress) + (Math.random() * 0.1),
          responsible_decision_making: 0.45 + (0.4 * dayProgress) + (Math.random() * 0.1),
          created_at: date.toISOString(),
          display_date: format(date, 'yyyy-MM-dd'),
          source_text: `Sample data for ${format(date, 'yyyy-MM-dd')}`
        };
        
        sampleData.push(samplePoint);
      }
    }
  }
  
  return sampleData.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

export const sampleInsightsData: EmotionalInsight[] = [
  {
    id: 'sample-1',
    child_id: 'sample-child',
    self_awareness: 0.65,
    self_management: 0.70,
    social_awareness: 0.60,
    relationship_skills: 0.55,
    responsible_decision_making: 0.68,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    source_text: 'Sample insight data 1'
  },
  {
    id: 'sample-2',
    child_id: 'sample-child',
    self_awareness: 0.68,
    self_management: 0.72,
    social_awareness: 0.62,
    relationship_skills: 0.58,
    responsible_decision_making: 0.70,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source_text: 'Sample insight data 2'
  },
  {
    id: 'sample-3',
    child_id: 'sample-child',
    self_awareness: 0.72,
    self_management: 0.75,
    social_awareness: 0.65,
    relationship_skills: 0.60,
    responsible_decision_making: 0.73,
    created_at: new Date().toISOString(),
    source_text: 'Sample insight data 3'
  }
];
