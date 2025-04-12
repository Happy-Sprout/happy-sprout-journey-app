
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ParentInfo } from "@/types/parentInfo";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface ParentInfoViewProps {
  parentInfo: ParentInfo;
  onEdit: () => void;
}

// Use memo to prevent unnecessary re-renders
const ParentInfoView = React.memo(({ parentInfo, onEdit }: ParentInfoViewProps) => {
  const { toast } = useToast();
  
  console.log("ParentInfoView - Rendering with parent info:", parentInfo?.id);
  
  // Added safety check to prevent rendering with invalid data
  if (!parentInfo || !parentInfo.id) {
    console.error("ParentInfoView - Received invalid parent info");
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Could not display parent information. Please try again.</p>
      </div>
    );
  }
  
  const handleChangePassword = (e: React.MouseEvent) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Change Password",
      description: "This feature is coming soon!",
    });
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ParentInfoView - Edit button clicked");
    onEdit();
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p className="text-lg text-left">{parentInfo.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Relationship to Child</h3>
          <p className="text-lg text-left">{parentInfo.relationship || "Parent"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="text-lg text-left">{parentInfo.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
          <p className="text-lg text-left">
            {parentInfo.emergencyContact || "Not provided"}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline"
          onClick={handleEdit}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Information
        </Button>
        <Button
          variant="outline"
          onClick={handleChangePassword}
        >
          Change Password
        </Button>
      </div>
    </>
  );
});

ParentInfoView.displayName = "ParentInfoView";

export default ParentInfoView;
