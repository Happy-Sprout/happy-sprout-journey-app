
import { Card } from "@/components/ui/card";
import { getBadgeInfo } from "@/utils/childUtils";

interface BadgesCardProps {
  badges: string[];
}

const BadgesCard = ({ badges }: BadgesCardProps) => {
  const badgeCount = badges.length;

  return (
    <Card className="p-3">
      <div className="flex flex-col items-center text-center">
        <img 
          src="/lovable-uploads/82323b4f-cc61-4fcf-903d-43c507bac3cb.png"
          alt="Badges"
          className="h-8 w-8 mb-2"
        />
        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide">Badges Earned</h3>
        <p className="text-xl font-bold text-gray-800 mt-1">{badgeCount}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {badgeCount > 0 ? (
            badges.slice(0, 3).map((badge, index) => {
              const badgeInfo = getBadgeInfo(badge);
              return (
                <div 
                  key={index} 
                  className="w-8 h-8 rounded-full bg-sprout-purple/10 flex items-center justify-center text-sprout-purple"
                  title={badgeInfo.title}
                >
                  {badgeInfo.icon}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No badges yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BadgesCard;
