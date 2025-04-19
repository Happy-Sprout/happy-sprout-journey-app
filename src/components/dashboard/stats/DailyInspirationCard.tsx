
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const DailyInspirationCard = () => {
  const [quote, setQuote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDailyQuote = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('get-daily-inspiration', {
          body: { userId: user.id, date: new Date().toISOString().split('T')[0] }
        });
        
        if (error) {
          console.error('Error fetching daily inspiration:', error);
          toast({
            title: "Couldn't fetch your daily inspiration",
            description: "Using a default quote instead",
            variant: "destructive",
          });
          // Fallback to a default quote
          setQuote("Believe you can and you're halfway there.");
        } else {
          setQuote(data.quote);
        }
      } catch (err) {
        console.error('Error in fetchDailyQuote:', err);
        setQuote("Each day is a new opportunity to grow and learn.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDailyQuote();
  }, [user?.id, toast]);

  return (
    <Card className="p-3">
      <div className="flex flex-col items-center text-center">
        <img 
          src="/lovable-uploads/8553a77a-7c02-4fac-81e0-9a434e82ad19.png"
          alt="Daily Inspiration"
          className="h-8 w-8 mb-2"
        />
        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Daily Inspiration</h3>
        {isLoading ? (
          <div className="mt-3 flex justify-center">
            <LoadingSpinner size={20} />
          </div>
        ) : (
          <p className="text-sm text-gray-600 mt-3 italic">"{quote}"</p>
        )}
      </div>
    </Card>
  );
};

export default DailyInspirationCard;
