
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, Lightbulb, Quote } from "lucide-react";
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
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="mb-3 relative"
          >
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            </motion.div>
          </motion.div>
          
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            <Quote className="inline h-3 w-3 mr-1 text-pink-500" />
            Daily Inspiration
          </h3>
          
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-4"
            >
              <LoadingSpinner size={24} />
              <span className="ml-2 text-sm text-gray-500">Loading inspiration...</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Quote className="absolute -top-2 -left-2 h-4 w-4 text-pink-300" />
              <motion.p 
                className="text-sm text-gray-700 font-medium italic leading-relaxed px-4 py-2 bg-white/60 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {quote}
              </motion.p>
              <Quote className="absolute -bottom-2 -right-2 h-4 w-4 text-pink-300 rotate-180" />
            </motion.div>
          )}
          
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-3 flex space-x-1"
          >
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DailyInspirationCard;
