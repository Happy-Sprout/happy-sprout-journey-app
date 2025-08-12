import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ParentInfo } from "@/types/parentInfo";
import { Edit, Mail, Phone, Heart, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParentInfoViewProps {
  parentInfo: ParentInfo;
  onEdit: () => void;
}

const ParentInfoView = React.memo(({ parentInfo, onEdit }: ParentInfoViewProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleChangePassword = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Change Password",
      description: "This feature is coming soon!",
    });
  }, [toast]);
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ParentInfoView - edit button clicked");
    onEdit();
  }, [onEdit]);
  
  if (!parentInfo || !parentInfo.id) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Could not display parent information. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-100 shadow-sm w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-sprout-purple/5 p-3 sm:p-4 rounded-lg border border-sprout-purple/10">
          <div className="flex items-center mb-2">
            <User className="h-5 w-5 text-sprout-purple mr-2 flex-shrink-0" />
            <h3 className="text-sm font-medium text-sprout-purple truncate">Name</h3>
          </div>
          <p className="text-base sm:text-lg text-left text-gray-700 break-words">{parentInfo.name}</p>
        </div>
        
        <div className="bg-sprout-orange/5 p-3 sm:p-4 rounded-lg border border-sprout-orange/10">
          <div className="flex items-center mb-2">
            <Heart className="h-5 w-5 text-sprout-orange mr-2 flex-shrink-0" />
            <h3 className="text-sm font-medium text-sprout-orange truncate">Relationship to Child</h3>
          </div>
          <p className="text-base sm:text-lg text-left text-gray-700 break-words">{parentInfo.relationship || "Parent"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <Mail className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <h3 className="text-sm font-medium text-blue-600 truncate">Email</h3>
          </div>
          <p className="text-base sm:text-lg text-left text-gray-700 break-words overflow-hidden overflow-ellipsis">{parentInfo.email}</p>
        </div>
        
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
          <div className="flex items-center mb-2">
            <Phone className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <h3 className="text-sm font-medium text-green-600 truncate">Emergency Contact</h3>
          </div>
          <p className="text-base sm:text-lg text-left text-gray-700 break-words">
            {parentInfo.emergencyContact || "Not provided"}
          </p>
        </div>
      </div>

      <Separator className="my-4 sm:my-6" />

      <div className="flex flex-col xs:flex-row gap-3 w-full">
        <Button 
          variant="outline"
          onClick={handleEdit}
          className="bg-sprout-purple/10 border-sprout-purple/20 text-sprout-purple hover:bg-sprout-purple/20 w-full"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Information
        </Button>
        <Button
          variant="outline"
          onClick={handleChangePassword}
          className="bg-sprout-cream border-sprout-orange/20 text-sprout-orange hover:bg-sprout-orange/10 w-full"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
});

ParentInfoView.displayName = "ParentInfoView";

export default ParentInfoView;
