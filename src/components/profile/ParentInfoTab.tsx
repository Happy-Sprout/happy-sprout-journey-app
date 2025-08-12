import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Edit, Save, X, Loader2, User, Mail, Heart, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ParentInfo {
  id: string;
  name: string;
  email: string;
  relationship: string;
  emergencyContact?: string;
}

const ParentInfoTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relationship: "Parent",
    emergencyContact: ""
  });
  
  const componentMounted = useRef(true);

  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Fetch parent info
  const fetchParentInfo = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching parent info for user:", user.id);
      
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching parent data:", error);
        return;
      }
      
      if (data) {
        const info: ParentInfo = {
          id: data.id,
          name: data.name,
          email: data.email,
          relationship: data.relationship,
          emergencyContact: data.emergency_contact || ""
        };
        setParentInfo(info);
        setFormData({
          name: info.name,
          email: info.email,
          relationship: info.relationship,
          emergencyContact: info.emergencyContact || ""
        });
      }
    } catch (error) {
      console.error("Error in fetchParentInfo:", error);
    } finally {
      if (componentMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchParentInfo();
  }, [fetchParentInfo]);

  const handleEdit = () => {
    if (parentInfo) {
      setFormData({
        name: parentInfo.name,
        email: parentInfo.email,
        relationship: parentInfo.relationship,
        emergencyContact: parentInfo.emergencyContact || ""
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (parentInfo) {
      setFormData({
        name: parentInfo.name,
        email: parentInfo.email,
        relationship: parentInfo.relationship,
        emergencyContact: parentInfo.emergencyContact || ""
      });
    }
  };

  const handleSave = async () => {
    if (!user?.id || !formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Saving parent info:", formData);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        relationship: formData.relationship,
        emergency_contact: formData.emergencyContact
      };

      const { data, error } = await supabase
        .from('parents')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error saving parent info:", error);
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log("Parent info saved successfully:", data);
      
      // Update local state
      const updatedInfo: ParentInfo = {
        id: data.id,
        name: data.name,
        email: data.email,
        relationship: data.relationship,
        emergencyContact: data.emergency_contact || ""
      };
      
      setParentInfo(updatedInfo);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      if (componentMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Input change - ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-3 text-sprout-purple" />
            <span className="text-lg text-sprout-purple">Loading parent information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sprout-purple/10 to-sprout-cream/20 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-sprout-purple flex items-center gap-2">
              <User className="w-6 h-6" />
              Parent Information
            </h2>
            <p className="text-gray-600 mt-1">Your contact information and account details</p>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="bg-sprout-purple text-white hover:bg-sprout-purple/90 border-sprout-purple"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Information
            </Button>
          )}
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter your full name"
                  className="bg-white border-purple-300 focus:border-purple-500 text-gray-900"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800">{formData.name}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter your email"
                  className="bg-white border-blue-300 focus:border-blue-500 text-gray-900"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800">{formData.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Relationship Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Relationship to Child
              </label>
              {isEditing ? (
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => handleInputChange('relationship', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-white border-orange-300 focus:border-orange-500">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Grandparent">Grandparent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-medium text-gray-800">{formData.relationship}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Contact
              </label>
              {isEditing ? (
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter emergency contact"
                  className="bg-white border-green-300 focus:border-green-500 text-gray-900"
                />
              ) : (
                <p className="text-lg font-medium text-gray-800">{formData.emergencyContact || "Not provided"}</p>
              )}
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Optional: Phone number or email of an emergency contact
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {isEditing ? (
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-sprout-purple hover:bg-sprout-purple/90 px-6"
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
        </div>
      ) : (
        <div className="flex justify-center">
          <Button 
            variant="outline"
            className="bg-gradient-to-r from-sprout-orange to-orange-500 text-white border-orange-400 hover:from-orange-500 hover:to-orange-600 px-8"
          >
            Change Password
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParentInfoTab;
