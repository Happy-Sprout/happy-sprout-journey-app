
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { JournalEntry } from "@/types/journal";
import { ChevronDown, Droplet, Clock, HeartPulse, CheckCircle, Heart, Sun } from "lucide-react";

type JournalEntryItemProps = {
  entry: JournalEntry;
}

export const JournalEntryItem = ({ entry }: JournalEntryItemProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };

  return (
    <Card key={entry.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{formatDate(entry.date)}</CardTitle>
          <div className="text-xl">
            {entry.mood >= 8 ? "😄" : entry.mood >= 5 ? "🙂" : entry.mood >= 3 ? "😐" : "😔"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <div className="font-medium">Daily Trackers</div>
            <div className="transition-transform group-open:rotate-180">
              <ChevronDown className="h-5 w-5" />
            </div>
          </summary>
          <div className="mt-3 pl-4 border-l-2 border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <Droplet className="w-4 h-4 mr-1 text-blue-500" /> Water: {entry.water} glasses
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-purple-500" /> Sleep: {entry.sleep} hours
              </div>
              <div className="flex items-center">
                <HeartPulse className="w-4 h-4 mr-1 text-red-500" /> Exercise: {entry.exercise}/10
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Mindfulness: {entry.mindfulness}/10
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-pink-500" /> Kind Acts: {entry.kindness}/10
              </div>
              <div className="flex items-center">
                <Sun className="w-4 h-4 mr-1 text-yellow-500" /> Positivity: {entry.positivity}/10
              </div>
            </div>
          </div>
        </details>
        
        <div className="mt-4 space-y-3">
          {entry.wentWell && (
            <div>
              <div className="font-medium text-sprout-green">What went well:</div>
              <p className="text-gray-700 mt-1">{entry.wentWell}</p>
            </div>
          )}
          
          {entry.wentBadly && (
            <div>
              <div className="font-medium text-sprout-orange">What didn't go well:</div>
              <p className="text-gray-700 mt-1">{entry.wentBadly}</p>
            </div>
          )}
          
          {entry.gratitude && (
            <div>
              <div className="font-medium text-sprout-purple">Gratitude:</div>
              <p className="text-gray-700 mt-1">{entry.gratitude}</p>
            </div>
          )}
          
          {entry.challenge && (
            <div>
              <div className="font-medium text-sprout-orange">Challenge:</div>
              <p className="text-gray-700 mt-1">{entry.challenge}</p>
            </div>
          )}
          
          {entry.tomorrowPlan && (
            <div>
              <div className="font-medium text-sprout-green">Tomorrow's Plan:</div>
              <p className="text-gray-700 mt-1">{entry.tomorrowPlan}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
