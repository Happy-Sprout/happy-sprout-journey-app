
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
    <Card key={entry.id} className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle>{formatDate(entry.date)}</CardTitle>
          <div className="text-xl">
            {entry.mood >= 8 ? "😄" : entry.mood >= 5 ? "🙂" : entry.mood >= 3 ? "😐" : "😔"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <details className="group mb-4">
          <summary className="flex justify-between items-center cursor-pointer list-none bg-gray-50 p-2 rounded-md">
            <div className="font-medium text-sprout-purple">Daily Trackers</div>
            <div className="transition-transform group-open:rotate-180">
              <ChevronDown className="h-5 w-5" />
            </div>
          </summary>
          <div className="mt-3 pl-4 border-l-2 border-gray-200 p-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center p-1 bg-blue-50 rounded">
                <Droplet className="w-4 h-4 mr-2 text-blue-500" /> <span className="font-medium">Water:</span> {entry.water} glasses
              </div>
              <div className="flex items-center p-1 bg-purple-50 rounded">
                <Clock className="w-4 h-4 mr-2 text-purple-500" /> <span className="font-medium">Sleep:</span> {entry.sleep} hours
              </div>
              <div className="flex items-center p-1 bg-red-50 rounded">
                <HeartPulse className="w-4 h-4 mr-2 text-red-500" /> <span className="font-medium">Exercise:</span> {entry.exercise}/10
              </div>
              <div className="flex items-center p-1 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> <span className="font-medium">Mindfulness:</span> {entry.mindfulness}/10
              </div>
              <div className="flex items-center p-1 bg-pink-50 rounded">
                <Heart className="w-4 h-4 mr-2 text-pink-500" /> <span className="font-medium">Kind Acts:</span> {entry.kindness}/10
              </div>
              <div className="flex items-center p-1 bg-yellow-50 rounded">
                <Sun className="w-4 h-4 mr-2 text-yellow-500" /> <span className="font-medium">Positivity:</span> {entry.positivity}/10
              </div>
            </div>
          </div>
        </details>
        
        <div className="space-y-4 mt-4">
          {entry.wentWell && (
            <div className="p-3 bg-sprout-green/10 rounded-md">
              <div className="font-medium text-sprout-green mb-1">What went well:</div>
              <p className="text-gray-700">{entry.wentWell}</p>
            </div>
          )}
          
          {entry.wentBadly && (
            <div className="p-3 bg-sprout-orange/10 rounded-md">
              <div className="font-medium text-sprout-orange mb-1">What didn't go well:</div>
              <p className="text-gray-700">{entry.wentBadly}</p>
            </div>
          )}
          
          {entry.gratitude && (
            <div className="p-3 bg-sprout-purple/10 rounded-md">
              <div className="font-medium text-sprout-purple mb-1">Gratitude:</div>
              <p className="text-gray-700">{entry.gratitude}</p>
            </div>
          )}
          
          {entry.challenge && (
            <div className="p-3 bg-sprout-orange/10 rounded-md">
              <div className="font-medium text-sprout-orange mb-1">Challenge:</div>
              <p className="text-gray-700">{entry.challenge}</p>
            </div>
          )}
          
          {entry.tomorrowPlan && (
            <div className="p-3 bg-sprout-green/10 rounded-md">
              <div className="font-medium text-sprout-green mb-1">Tomorrow's Plan:</div>
              <p className="text-gray-700">{entry.tomorrowPlan}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
