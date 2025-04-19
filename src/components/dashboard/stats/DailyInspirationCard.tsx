
import { Card } from "@/components/ui/card";

const DailyInspirationCard = () => {
  const getRandomQuote = () => {
    const motivationalQuotes = [
      "Believe you can and you're halfway there.",
      "You are braver than you believe, stronger than you seem, and smarter than you think.",
      "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      "It always seems impossible until it's done.",
      "You're off to great places! Today is your day! Your mountain is waiting, so get on your way!"
    ];
    
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  return (
    <Card className="p-3">
      <div className="flex flex-col items-center text-center">
        <img 
          src="/lovable-uploads/8553a77a-7c02-4fac-81e0-9a434e82ad19.png"
          alt="Daily Inspiration"
          className="h-8 w-8 mb-2"
        />
        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Daily Inspiration</h3>
        <p className="text-sm text-gray-600 mt-3 italic">"{getRandomQuote()}"</p>
      </div>
    </Card>
  );
};

export default DailyInspirationCard;
