
import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";

interface DevelopmentToolsProps {
  isFallbackData: boolean;
  connectionError: boolean;
  isDbConnected: boolean | null;
  isDevelopment: boolean;
  insertSampleData: () => void;
}

const DevelopmentTools = ({ 
  isFallbackData, 
  connectionError, 
  isDbConnected, 
  isDevelopment,
  insertSampleData 
}: DevelopmentToolsProps) => {
  if (!((isFallbackData || connectionError || isDbConnected === false) && isDevelopment)) {
    return null;
  }

  return (
    <div className="mb-8 flex justify-center">
      <Button 
        variant="outline" 
        size="sm"
        onClick={insertSampleData}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Beaker className="h-4 w-4" />
        Generate Sample Emotional Data
      </Button>
    </div>
  );
};

export default DevelopmentTools;
