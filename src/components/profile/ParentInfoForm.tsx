import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { memo, useCallback, useEffect, useRef } from "react";

interface ParentInfoFormProps {
  parentForm: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing: boolean; // Made required by removing ?
}

const ParentInfoForm = memo(({ parentForm, onSubmit, onCancel, isSubmitting = false, isEditing }: ParentInfoFormProps) => {
  const submittedOnce = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const componentMounted = useRef(true);

  // Reset submission state when component mounts or isSubmitting changes
  useEffect(() => {
    if (!isSubmitting) {
      submittedOnce.current = false;
    }
  }, [isSubmitting]);

  // Add cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("ParentInfoForm component is unmounting");
      componentMounted.current = false;
    };
  }, []);

  const handleFormSubmit = useCallback((data: any) => {
    console.log("ParentInfoForm - Form submitted with data:", data);
    
    if (submittedOnce.current || isSubmitting) {
      console.log("Preventing duplicate form submission");
      return;
    }
    
    // Mark as submitted to prevent duplicate submissions
    submittedOnce.current = true;
    
    // Only submit if component is still mounted
    if (componentMounted.current) {
      onSubmit(data);
    } else {
      console.log("Not submitting because component is unmounted");
    }
  }, [onSubmit, isSubmitting]);

  const handleCancel = useCallback((e) => {
    console.log("ParentInfoForm - Cancel button clicked");
    e.preventDefault();
    if (!isSubmitting) {
      onCancel();
    }
  }, [onCancel, isSubmitting]);

  console.log("Form render - isSubmitting:", isSubmitting, "isEditing:", isEditing);

  return (
    <Form {...parentForm}>
      <form 
        ref={formRef}
        onSubmit={parentForm.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={parentForm.control}
            name="name"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-left">Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    {...field} 
                    disabled={isSubmitting || !isEditing}
                    className={`${isEditing ? "bg-white" : "bg-gray-100"}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={parentForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-left">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email" 
                    {...field} 
                    disabled={isSubmitting || !isEditing}
                    className={`${isEditing ? "bg-white" : "bg-gray-100"}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={parentForm.control}
            name="relationship"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-left">Relationship to Child</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={isSubmitting || !isEditing}
                >
                  <FormControl>
                    <SelectTrigger className={`${isEditing ? "bg-white" : "bg-gray-100"}`}>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Grandparent">Grandparent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={parentForm.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-left">Emergency Contact</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter emergency contact" 
                    {...field} 
                    disabled={isSubmitting || !isEditing}
                    className={`${isEditing ? "bg-white" : "bg-gray-100"}`}
                  />
                </FormControl>
                <FormDescription className="text-left">
                  Optional: Phone number or email of an emergency contact
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {isEditing && (
            <Button 
              type="submit" 
              className="sprout-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
});

ParentInfoForm.displayName = "ParentInfoForm";

export default ParentInfoForm;
