
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Plus, UserCircle } from "lucide-react";
import ChildProfilesList from "./ChildProfilesList";
import ChildRelationshipDialog from "./ChildRelationshipDialog";
import DeleteProfileDialog from "./DeleteProfileDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const ChildProfilesTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { childProfiles, deleteChildProfile, currentChildId, setRelationshipToParent, refreshChildProfiles, user } = useUser();
  const isMobile = useIsMobile();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [editChildRelationship, setEditChildRelationship] = useState<string | null>(null);
  const [relationshipValue, setRelationshipValue] = useState("");
  
  // Track if we've already refreshed profiles to prevent multiple refreshes
  const refreshed = useRef(false);
  const isLoading = useRef(false);

  // Ensure we fetch the latest profiles only once when this component mounts
  useEffect(() => {
    if (user?.id && !refreshed.current && !isLoading.current) {
      console.log("Initial child profiles fetch");
      isLoading.current = true;
      refreshed.current = true;
      refreshChildProfiles(user.id).finally(() => {
        isLoading.current = false;
      });
    }
    
    return () => {
      refreshed.current = false; // Reset when component unmounts
      isLoading.current = false;
    };
  }, [refreshChildProfiles, user]);

  const handleDeleteProfile = useCallback((id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (profileToDelete) {
      try {
        await deleteChildProfile(profileToDelete);
        toast({
          title: "Profile Deleted",
          description: "The child profile has been successfully deleted.",
        });
        
        // Refresh profiles after deletion
        if (user?.id) {
          refreshChildProfiles(user.id);
        }
      } catch (error) {
        console.error("Error deleting profile:", error);
        toast({
          title: "Error",
          description: "Failed to delete profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setDeleteDialogOpen(false);
        setProfileToDelete(null);
      }
    }
  }, [profileToDelete, deleteChildProfile, toast, user, refreshChildProfiles]);

  const handleSaveRelationship = useCallback(async () => {
    if (editChildRelationship && relationshipValue) {
      try {
        await setRelationshipToParent(editChildRelationship, relationshipValue);
        
        toast({
          title: "Relationship Updated",
          description: "The relationship has been successfully updated.",
        });
        
        // Refresh profiles after update
        if (user?.id) {
          refreshChildProfiles(user.id);
        }
      } catch (error) {
        console.error("Error updating relationship:", error);
        toast({
          title: "Error",
          description: "Failed to update relationship. Please try again.",
          variant: "destructive"
        });
      } finally {
        setEditChildRelationship(null);
        setRelationshipValue("");
      }
    }
  }, [editChildRelationship, relationshipValue, setRelationshipToParent, toast, user, refreshChildProfiles]);

  const handleCreateProfile = useCallback(() => {
    navigate("/create-profile");
  }, [navigate]);

  const handleEditRelationship = useCallback((id: string, relationship: string | undefined) => {
    setEditChildRelationship(id);
    setRelationshipValue(relationship || "");
  }, []);

  // Memoize the child profiles view to prevent re-renders
  const childProfilesView = useMemo(() => {
    if (childProfiles.length === 0) {
      return (
        <Card>
          <div className="text-center py-8 p-6">
            <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Child Profiles Yet</h3>
            <p className="text-gray-500 mb-4">
              Create a profile to track your child's emotional learning journey
            </p>
            <Button
              className="sprout-button"
              onClick={handleCreateProfile}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <ChildProfilesList 
        onDeleteProfile={handleDeleteProfile}
        onEditRelationship={handleEditRelationship}
      />
    );
  }, [childProfiles.length, handleCreateProfile, handleDeleteProfile, handleEditRelationship]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Child Profiles</h2>
        <Button
          className="sprout-button w-full sm:w-auto"
          onClick={handleCreateProfile}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Profile
        </Button>
      </div>

      {childProfilesView}

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
        onSave={handleSaveRelationship}
      />
    </>
  );
};

export default ChildProfilesTab;
