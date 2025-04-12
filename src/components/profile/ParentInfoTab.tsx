
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";
import ParentInfoForm from "./ParentInfoForm";
import ParentInfoView from "./ParentInfoView";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useParent } from "@/hooks/useParent";

const parentProfileSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  relationship: z.string(),
  emergencyContact: z.string().optional(),
});

const ParentInfoTab = () => {
  const { toast } = useToast();
  const { parentInfo, isLoading, updateParentInfo, setParentInfo } = useParent();
  const [editParentMode, setEditParentMode] = useState(false);
  
  // Add a console log to check parentInfo on mount and updates
  useEffect(() => {
    console.log("ParentInfoTab - parentInfo updated:", parentInfo);
  }, [parentInfo]);
  
  const parentForm = useForm<z.infer<typeof parentProfileSchema>>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      relationship: "Parent",
      emergencyContact: "",
    },
  });

  // Update form values when parentInfo changes and not in edit mode
  useEffect(() => {
    if (parentInfo && !editParentMode) {
      console.log("Resetting form with parent info:", parentInfo);
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [parentInfo, parentForm, editParentMode]);

  // When entering edit mode, initialize the form with current values
  useEffect(() => {
    if (editParentMode && parentInfo) {
      console.log("Entering edit mode, initializing form with:", parentInfo);
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [editParentMode, parentInfo, parentForm]);

  const saveParentProfile = async (data: z.infer<typeof parentProfileSchema>) => {
    try {
      console.log("Form data to save:", data);
      
      if (parentInfo) {
        console.log("Updating existing parent profile with:", data);
        await updateParentInfo({
          ...data,
          id: parentInfo.id,
        });
      } else {
        console.log("Creating new parent profile with:", data);
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
      
      setEditParentMode(false);
    } catch (error) {
      console.error("Error saving parent profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    console.log("Canceling edit mode");
    setEditParentMode(false);
    
    // Reset form to current parent info values when canceling
    if (parentInfo) {
      parentForm.reset({
        name: parentInfo.name,
        email: parentInfo.email,
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  };

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
              onClick={() => setEditParentMode(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Information
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading parent information...</p>
          </div>
        ) : !editParentMode ? (
          parentInfo ? (
            <ParentInfoView 
              parentInfo={parentInfo} 
              onEdit={() => setEditParentMode(true)}
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
            onCancel={handleCancelEdit}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ParentInfoTab;
