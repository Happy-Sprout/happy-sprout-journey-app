
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
  });

  useEffect(() => {
    if (parentInfo && !editParentMode && !formInitialized.current && componentMounted.current) {
      console.log("Initializing parent form with data - one time only");
      formInitialized.current = true;
      
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
    
    return () => {
      componentMounted.current = false;
    };
  }, [parentInfo, parentForm, editParentMode]);

  useEffect(() => {
    if (editParentMode && parentInfo && componentMounted.current) {
      console.log("Entering edit mode - resetting form with current values");
      parentForm.reset({
        name: parentInfo.name || "",
        email: parentInfo.email || "",
        relationship: parentInfo.relationship || "Parent",
        emergencyContact: parentInfo.emergencyContact || "",
      });
    }
  }, [editParentMode, parentInfo, parentForm]);

  const saveParentProfile = useCallback(async (data: z.infer<typeof parentProfileSchema>) => {
    // Debug log to track function execution
    console.log("saveParentProfile called with data:", data);
    
    // Prevent duplicate submissions
    if (!componentMounted.current || isSubmitting) {
      console.log("Submission prevented: component unmounted or already submitting");
      return;
    }
    
    // Set submitting state to true to show loading UI
    setIsSubmitting(true);
    
    try {
      if (parentInfo) {
        console.log("Updating existing parent profile");
        const success = await updateParentInfo({
          ...parentInfo,
          ...data,
        });
        
        console.log("Update result:", success);
        
        if (success) {
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          });
          setEditParentMode(false);
        }
      } else {
        console.log("Creating new parent profile");
        await setParentInfo({
          id: uuidv4(),
          name: data.name,
          email: data.email,
          relationship: data.relationship || "Parent",
          emergencyContact: data.emergencyContact || "",
        });
        
        toast({
          title: "Profile Created",
          description: "Your profile has been successfully created.",
        });
        
        setEditParentMode(false);
      }
    } catch (error) {
      console.error("ParentInfoTab - Error saving parent profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Always reset the submitting state, regardless of outcome
      if (componentMounted.current) {
        console.log("Resetting isSubmitting state");
        setIsSubmitting(false);
      }
    }
  }, [parentInfo, updateParentInfo, setParentInfo, toast, isSubmitting]);

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
        isSubmitting={isSubmitting}
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
