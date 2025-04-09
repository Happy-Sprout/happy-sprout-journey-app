
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Plus, UserCircle } from "lucide-react";
import ChildProfilesList from "./ChildProfilesList";
import ChildRelationshipDialog from "./ChildRelationshipDialog";
import DeleteProfileDialog from "./DeleteProfileDialog";

const ChildProfilesTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { childProfiles, deleteChildProfile, currentChildId } = useUser();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [editChildRelationship, setEditChildRelationship] = useState<string | null>(null);
  const [relationshipValue, setRelationshipValue] = useState("");

  const handleDeleteProfile = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteChildProfile(profileToDelete);
      toast({
        title: "Profile Deleted",
        description: "The child profile has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Child Profiles</h2>
        <Button
          className="sprout-button"
          onClick={() => navigate("/create-profile")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Profile
        </Button>
      </div>

      {childProfiles.length === 0 ? (
        <Card>
          <div className="text-center py-8 p-6">
            <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Child Profiles Yet</h3>
            <p className="text-gray-500 mb-4">
              Create a profile to track your child's emotional learning journey
            </p>
            <Button
              className="sprout-button"
              onClick={() => navigate("/create-profile")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </div>
        </Card>
      ) : (
        <ChildProfilesList 
          onDeleteProfile={handleDeleteProfile}
          onEditRelationship={(id, relationship) => {
            setEditChildRelationship(id);
            setRelationshipValue(relationship || "");
          }}
        />
      )}

      <DeleteProfileDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
      
      <ChildRelationshipDialog
        open={!!editChildRelationship}
        onOpenChange={(open) => !open && setEditChildRelationship(null)}
        relationshipValue={relationshipValue}
        setRelationshipValue={setRelationshipValue}
        onSave={() => {
          if (editChildRelationship && relationshipValue) {
            const { setRelationshipToParent } = useUser();
            setRelationshipToParent(editChildRelationship, relationshipValue);
            
            toast({
              title: "Relationship Updated",
              description: "The relationship has been successfully updated.",
            });
            
            setEditChildRelationship(null);
            setRelationshipValue("");
          }
        }}
      />
    </>
  );
};

export default ChildProfilesTab;
