
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { memo, useCallback, useState } from "react";

interface ParentInfoFormProps {
  parentForm: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ParentInfoForm = memo(({ parentForm, onSubmit, onCancel, isSubmitting = false }: ParentInfoFormProps) => {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const submitting = isSubmitting || localSubmitting;

  const handleFormSubmit = useCallback((data: any) => {
    console.log("ParentInfoForm - Form submitted with data:", data);
    setLocalSubmitting(true);
    
    // Call onSubmit asynchronously to prevent React state batching issues
    setTimeout(() => {
      onSubmit(data);
      // We don't reset localSubmitting here because the parent component
      // should control the overall submission state through the isSubmitting prop
    }, 0);
  }, [onSubmit]);

  const handleCancel = useCallback(() => {
    console.log("ParentInfoForm - Cancel button clicked");
    if (!submitting) {
      onCancel();
    }
  }, [onCancel, submitting]);

  return (
    <Form {...parentForm}>
      <form onSubmit={parentForm.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
                >
                  <FormControl>
                    <SelectTrigger>
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
                    disabled={submitting}
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
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="sprout-button"
            disabled={submitting}
          >
            {submitting ? (
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
        </div>
      </form>
    </Form>
  );
});

ParentInfoForm.displayName = "ParentInfoForm";

export default ParentInfoForm;
