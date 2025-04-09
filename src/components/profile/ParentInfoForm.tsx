
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface ParentInfoFormProps {
  parentForm: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ParentInfoForm = ({ parentForm, onSubmit, onCancel }: ParentInfoFormProps) => {
  return (
    <Form {...parentForm}>
      <form onSubmit={parentForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={parentForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={parentForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={parentForm.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Relationship to Child</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
              <FormItem>
                <FormLabel className="block">Emergency Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Enter emergency contact" {...field} />
                </FormControl>
                <FormDescription>
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="sprout-button">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ParentInfoForm;
