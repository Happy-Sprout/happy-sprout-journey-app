import { Button } from "@/components/ui/button";
import { List, BarChart2 } from "lucide-react";
import WellnessRadarChart from "../../wellness/WellnessRadarChart";
import WellnessTrendChart from "../../wellness/WellnessTrendChart";
import { JournalEntry } from "@/types/journal";

type WellnessViewMode = "radar" | "trend";

interface WellnessSectionProps {
  wellnessView: WellnessViewMode;
  setWellnessView: (view: WellnessViewMode) => void;
  todayEntry: JournalEntry | null;
  journalLoading: boolean;
  currentChildId: string;
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
}

const WellnessSection = ({
  wellnessView,
  setWellnessView,
  todayEntry,
  journalLoading,
  currentChildId,
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
}: WellnessSectionProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Wellness Trends</h3>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={wellnessView === "radar" ? "default" : "outline"}
            onClick={() => setWellnessView("radar")}
            className="rounded-full text-xs"
          >
            <List className="h-4 w-4 mr-1" /> Snapshot
          </Button>
          <Button 
            size="sm" 
            variant={wellnessView === "trend" ? "default" : "outline"}
            onClick={() => setWellnessView("trend")}
            className="rounded-full text-xs"
          >
            <BarChart2 className="h-4 w-4 mr-1" /> Trends
          </Button>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {wellnessView === "radar" ? (
          <WellnessRadarChart 
            journalEntry={todayEntry} 
            loading={journalLoading} 
          />
        ) : (
          <WellnessTrendChart 
            childId={currentChildId}
            currentWeekStart={currentWeekStart}
            onPrevWeek={onPrevWeek}
            onNextWeek={onNextWeek}
            onResetWeek={onResetWeek}
          />
        )}
      </div>
    </div>
  );
};

export default WellnessSection;
