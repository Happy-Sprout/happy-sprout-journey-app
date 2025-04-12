
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Edit } from "lucide-react";
import ParentInfoForm from "./ParentInfoForm";
import ParentInfoView from "./ParentInfoView";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

const parentProfileSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  relationship: z.string(),
  emergencyContact: z.string().optional(),
});

const ParentInfoTab = () => {
  const { toast } = useToast();
  const { parentInfo, setParentInfo, updateParentInfo } = useUser();
  const [editParentMode, setEditParentMode] = useState(false);
  
  const parentForm = useForm<z.infer<typeof parentProfileSchema>>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      name: parentInfo?.name || "",
      email: parentInfo?.email || "",
      relationship: parentInfo?.relationship || "Parent",
      emergencyContact: parentInfo?.emergencyContact || "",
    },
  });

  const saveParentProfile = async (data: z.infer<typeof parentProfileSchema>) => {
    try {
      if (parentInfo) {
        await updateParentInfo({
          ...data,
          id: parentInfo.id,
        });
      } else {
        await setParentInfo({
          id: uuidv4(),
          name: data.name,
          email: data.email,
          relationship: data.relationship || "Parent",
          emergencyContact: data.emergencyContact || "",
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your parent profile has been successfully updated.",
      });
      
      // Explicitly exit edit mode and reset form after successful save
      setEditParentMode(false);
      
      // Force reset the form to ensure clean state
      parentForm.reset({
        name: data.name,
        email: data.email,
        relationship: data.relationship,
        emergencyContact: data.emergencyContact || "",
      });
      
    } catch (error) {
      console.error("Error saving parent profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update form values when parentInfo changes
  React.useEffect(() => {
    if (parentInfo) {
      parentForm.reset({
        name: parentInfo.name,
        email: parentInfo.email,
        relationship: parentInfo.relationship,
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [parentInfo, parentForm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Parent Information</CardTitle>
            <CardDescription>
              Your contact information and account details
            </CardDescription>
          </div>
          {!editParentMode && parentInfo && (
            <Button 
              variant="outline" 
              onClick={() => {
                if (parentInfo) {
                  parentForm.reset({
                    name: parentInfo.name,
                    email: parentInfo.email,
                    relationship: parentInfo.relationship,
                    emergencyContact: parentInfo.emergencyContact || "",
                  });
                }
                setEditParentMode(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Information
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editParentMode ? (
          parentInfo ? (
            <ParentInfoView 
              parentInfo={parentInfo} 
              onEdit={() => {
                parentForm.reset({
                  name: parentInfo.name,
                  email: parentInfo.email,
                  relationship: parentInfo.relationship,
                  emergencyContact: parentInfo.emergencyContact || "",
                });
                setEditParentMode(true);
              }}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No parent information available. Please add your information.</p>
              <Button onClick={() => setEditParentMode(true)} className="sprout-button">
                Add Parent Information
              </Button>
            </div>
          )
        ) : (
          <ParentInfoForm 
            parentForm={parentForm} 
            onSubmit={saveParentProfile}
            onCancel={() => setEditParentMode(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ParentInfoTab;
