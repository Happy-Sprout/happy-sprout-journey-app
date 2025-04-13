
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ParentInfoForm from "./ParentInfoForm";
import ParentInfoView from "./ParentInfoView";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useParent } from "@/hooks/useParent";
import { LoadingSpinner } from "../ui/loading-spinner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formInitialized = useRef(false);
  const componentMounted = useRef(true);
  
  const parentForm = useForm<z.infer<typeof parentProfileSchema>>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      relationship: "Parent",
      emergencyContact: "",
    },
    mode: "onChange" // Add this to make validation more responsive
  });

  // Set up cleanup when component unmounts
  useEffect(() => {
    componentMounted.current = true;
    
    return () => {
      console.log("ParentInfoTab component unmounting");
      componentMounted.current = false;
    };
  }, []);

  // Initialize form with parent info once
  useEffect(() => {
    if (parentInfo && !formInitialized.current && componentMounted.current) {
      console.log("Initializing parent form with data - one time only");
      formInitialized.current = true;
      
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [parentInfo, parentForm]);

  // Reset form when entering edit mode
  useEffect(() => {
    if (editParentMode && parentInfo && componentMounted.current) {
      console.log("Entering edit mode - resetting form with current values", parentInfo);
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [editParentMode, parentInfo, parentForm]);

  const saveParentProfile = useCallback(async (data: z.infer<typeof parentProfileSchema>) => {
    console.log("saveParentProfile called with data:", data);
    
    // Prevent submission if component is unmounted
    if (!componentMounted.current) {
      console.log("Component unmounted, not saving");
      return;
    }
    
    // Set submitting state
    console.log("Setting isSubmitting to true");
    setIsSubmitting(true);
    
    try {
      if (parentInfo) {
        console.log("Updating existing parent profile");
        const updatedInfo = {
          ...parentInfo,
          ...data,
        };
        console.log("Calling updateParentInfo with:", updatedInfo);
        const success = await updateParentInfo(updatedInfo);
        
        console.log("Update result:", success);
        
        if (success && componentMounted.current) {
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          });
          setEditParentMode(false);
        } else if (componentMounted.current) {
          toast({
            title: "Update Failed",
            description: "Could not update the profile. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Creating new parent profile");
        const newParentInfo = {
          id: uuidv4(),
          name: data.name,
          email: data.email,
          relationship: data.relationship || "Parent",
          emergencyContact: data.emergencyContact || "",
        };
        console.log("Calling setParentInfo with:", newParentInfo);
        const success = await setParentInfo(newParentInfo);
        
        if (success && componentMounted.current) {
          toast({
            title: "Profile Created",
            description: "Your profile has been successfully created.",
          });
          setEditParentMode(false);
        } else if (componentMounted.current) {
          toast({
            title: "Creation Failed",
            description: "Could not create the profile. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("ParentInfoTab - Error saving parent profile:", error);
      if (componentMounted.current) {
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      // Reset submitting state if still mounted
      if (componentMounted.current) {
        console.log("Resetting isSubmitting to false");
        setIsSubmitting(false);
      }
    }
  }, [parentInfo, updateParentInfo, setParentInfo, toast]);

  const handleCancelEdit = useCallback(() => {
    console.log("Cancel edit clicked");
    if (!isSubmitting) {
      setEditParentMode(false);
      
      if (parentInfo) {
        parentForm.reset({
          name: parentInfo.name,
          email: parentInfo.email,
          relationship: parentInfo.relationship || "Parent",
          emergencyContact: parentInfo.emergencyContact || "",
        });
      }
    }
  }, [parentInfo, parentForm, isSubmitting]);

  const handleStartEdit = useCallback(() => {
    console.log("Start edit clicked");
    setEditParentMode(true);
  }, []);

  // Create card content based on current state
  const cardContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-6">
          <LoadingSpinner message="Loading parent information..." />
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
          <button 
            onClick={handleStartEdit} 
            className="sprout-button bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Parent Information
          </button>
        </div>
      );
    }
    
    console.log("Rendering form in edit mode", { isEditing: true, isSubmitting });
    
    return (
      <ParentInfoForm 
        parentForm={parentForm} 
        onSubmit={saveParentProfile}
        onCancel={handleCancelEdit}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    );
  }, [isLoading, editParentMode, parentInfo, handleStartEdit, parentForm, saveParentProfile, handleCancelEdit, isSubmitting]);

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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cardContent}
      </CardContent>
    </Card>
  );
};

export default React.memo(ParentInfoTab);
