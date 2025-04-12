
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const formInitialized = useRef(false);
  
  // Create the form with resolver
  const parentForm = useForm<z.infer<typeof parentProfileSchema>>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      relationship: "Parent",
      emergencyContact: "",
    },
  });

  // Only update form when parent info changes and we're not in edit mode
  useEffect(() => {
    if (parentInfo && !editParentMode && !formInitialized.current) {
      formInitialized.current = true;
      console.log("Initializing parent form with data");
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
      console.log("Setting form values for edit mode");
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [editParentMode, parentInfo, parentForm]);

  const saveParentProfile = useCallback(async (data: z.infer<typeof parentProfileSchema>) => {
    try {
      if (parentInfo) {
        console.log("Updating existing parent profile");
        await updateParentInfo({
          ...parentInfo, // Keep existing fields
          ...data, // Update with new data
        });
      } else {
        console.log("Creating new parent profile");
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
        description: "Your profile has been successfully updated.",
      });
      
      setEditParentMode(false);
    } catch (error) {
      console.error("ParentInfoTab - Error saving parent profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [parentInfo, updateParentInfo, setParentInfo, toast]);

  const handleCancelEdit = useCallback(() => {
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
  }, [parentInfo, parentForm]);

  const handleStartEdit = useCallback(() => {
    setEditParentMode(true);
  }, []);

  // Memoize the content based on loading and edit state
  const cardContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading parent information...</p>
        </div>
      );
    }

    if (!editParentMode) {
      if (parentInfo) {
        return (
          <ParentInfoView 
            parentInfo={parentInfo} 
            onEdit={handleStartEdit}
          />
        );
      }
      
      return (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">No parent information available. Please add your information.</p>
          <Button onClick={handleStartEdit} className="sprout-button">
            Add Parent Information
          </Button>
        </div>
      );
    }
    
    return (
      <ParentInfoForm 
        parentForm={parentForm} 
        onSubmit={saveParentProfile}
        onCancel={handleCancelEdit}
      />
    );
  }, [isLoading, editParentMode, parentInfo, handleStartEdit, parentForm, saveParentProfile, handleCancelEdit]);

  // Memoize the header actions to prevent re-renders
  const headerActions = useMemo(() => {
    if (!editParentMode && parentInfo) {
      return (
        <Button 
          variant="outline" 
          onClick={handleStartEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Information
        </Button>
      );
    }
    return null;
  }, [editParentMode, parentInfo, handleStartEdit]);

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
          {headerActions}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cardContent}
      </CardContent>
    </Card>
  );
};

export default React.memo(ParentInfoTab);
