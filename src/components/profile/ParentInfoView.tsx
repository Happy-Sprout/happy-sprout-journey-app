
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ParentInfo } from "@/types/parentInfo";
import { Edit, Mail, Phone, Heart, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useCallback } from "react";

interface ParentInfoViewProps {
  parentInfo: ParentInfo;
  onEdit: () => void;
}

// Use memo to prevent unnecessary re-renders
const ParentInfoView = React.memo(({ parentInfo, onEdit }: ParentInfoViewProps) => {
  const { toast } = useToast();
  
  // Added safety check to prevent rendering with invalid data
  if (!parentInfo || !parentInfo.id) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Could not display parent information. Please try again.</p>
      </div>
    );
  }
  
  const handleChangePassword = useCallback((e: React.MouseEvent) => {
    // Prevent any default behavior
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
    onEdit();
  }, [onEdit]);
  
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-sprout-purple/5 p-4 rounded-lg border border-sprout-purple/10">
          <div className="flex items-center mb-2">
            <User className="h-5 w-5 text-sprout-purple mr-2" />
            <h3 className="text-sm font-medium text-sprout-purple">Name</h3>
          </div>
          <p className="text-lg text-left text-gray-700">{parentInfo.name}</p>
        </div>
        
        <div className="bg-sprout-orange/5 p-4 rounded-lg border border-sprout-orange/10">
          <div className="flex items-center mb-2">
            <Heart className="h-5 w-5 text-sprout-orange mr-2" />
            <h3 className="text-sm font-medium text-sprout-orange">Relationship to Child</h3>
          </div>
          <p className="text-lg text-left text-gray-700">{parentInfo.relationship || "Parent"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-600">Email</h3>
          </div>
          <p className="text-lg text-left text-gray-700">{parentInfo.email}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center mb-2">
            <Phone className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-green-600">Emergency Contact</h3>
          </div>
          <p className="text-lg text-left text-gray-700">
            {parentInfo.emergencyContact || "Not provided"}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline"
          onClick={handleEdit}
          className="bg-sprout-purple/10 border-sprout-purple/20 text-sprout-purple hover:bg-sprout-purple/20"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Information
        </Button>
        <Button
          variant="outline"
          onClick={handleChangePassword}
          className="bg-sprout-cream border-sprout-orange/20 text-sprout-orange hover:bg-sprout-orange/10"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
});

ParentInfoView.displayName = "ParentInfoView";

export default ParentInfoView;
