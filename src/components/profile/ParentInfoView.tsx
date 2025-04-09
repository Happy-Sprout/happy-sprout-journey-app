
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ParentInfo } from "@/contexts/UserContext";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParentInfoViewProps {
  parentInfo: ParentInfo;
  onEdit: () => void;
}

const ParentInfoView = ({ parentInfo, onEdit }: ParentInfoViewProps) => {
  const { toast } = useToast();
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p className="text-lg">{parentInfo.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Relationship to Child</h3>
          <p className="text-lg">{parentInfo.relationship || "Parent"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="text-lg">{parentInfo.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
          <p className="text-lg">
            {parentInfo.emergencyContact || "Not provided"}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline"
          onClick={onEdit}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Information
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Change Password",
              description: "This feature is coming soon!",
            });
          }}
        >
          Change Password
        </Button>
      </div>
    </>
  );
};

export default ParentInfoView;
