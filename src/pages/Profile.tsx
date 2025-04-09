
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { Edit, Plus, Trash2, UserCircle, Save } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { avatarOptions } from "@/constants/profileOptions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    childProfiles, 
    deleteChildProfile, 
    parentInfo, 
    setParentInfo,
    updateParentInfo,
    currentChildId, 
    setCurrentChildId,
    getCurrentChild,
    setRelationshipToParent
  } = useUser();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [editParentMode, setEditParentMode] = useState(false);
  const [editChildRelationship, setEditChildRelationship] = useState<string | null>(null);
  const [relationshipValue, setRelationshipValue] = useState("");

  // Parent profile form schema
  const parentProfileSchema = z.object({
    name: z.string().min(2, "Name must have at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    relationship: z.string(),
    emergencyContact: z.string().optional(),
  });

  const parentForm = useForm<z.infer<typeof parentProfileSchema>>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      name: parentInfo?.name || "",
      email: parentInfo?.email || "",
      relationship: parentInfo?.relationship || "Parent",
      emergencyContact: parentInfo?.emergencyContact || "",
    },
  });

  // Handle profile deletion
  const handleDeleteProfile = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteChildProfile(profileToDelete);
      toast({
        title: "Profile Deleted",
        description: "The child profile has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  // Get avatar image for the child
  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return avatarOptions[0].src;
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar ? avatar.src : avatarOptions[0].src;
  };

  // Map learning style to readable format
  const getLearningStyleLabel = (style: string | undefined) => {
    switch (style) {
      case "visual":
        return "Visual Learner";
      case "auditory":
        return "Auditory Learner";
      case "kinesthetic":
        return "Kinesthetic Learner";
      case "mixed":
        return "Mixed Learning Style";
      default:
        return "Not specified";
    }
  };

  // Map SEL strength to readable format
  const getSELStrengthLabel = (strength: string | undefined) => {
    switch (strength) {
      case "self-awareness":
        return "Self-Awareness";
      case "self-management":
        return "Self-Management";
      case "social-awareness":
        return "Social Awareness";
      case "relationship-skills":
        return "Relationship Skills";
      case "decision-making":
        return "Responsible Decision-Making";
      case "unaware":
        return "Still Exploring";
      default:
        return "Not specified";
    }
  };

  // Format to readable string
  const formatArrayToString = (array: string[] | undefined) => {
    return array?.join(", ") || "None selected";
  };

  // Save parent profile
  const saveParentProfile = (data: z.infer<typeof parentProfileSchema>) => {
    if (parentInfo) {
      updateParentInfo({
        ...data,
        id: parentInfo.id,
      });
    } else {
      setParentInfo({
        id: uuidv4(),
        ...data,
      });
    }
    
    toast({
      title: "Profile Updated",
      description: "Your parent profile has been successfully updated.",
    });
    
    setEditParentMode(false);
  };

  // Handle relationship update
  const handleRelationshipSave = () => {
    if (editChildRelationship && relationshipValue) {
      setRelationshipToParent(editChildRelationship, relationshipValue);
      
      toast({
        title: "Relationship Updated",
        description: "The relationship has been successfully updated.",
      });
      
      setEditChildRelationship(null);
      setRelationshipValue("");
    }
  };

  const currentChild = getCurrentChild();

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Profiles</h1>
        <p className="text-gray-600 mb-8">
          Manage child profiles and parent information
        </p>

        <Tabs defaultValue="children" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="children">Child Profiles</TabsTrigger>
            <TabsTrigger value="parent">Parent Information</TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Child Profiles</h2>
              <Button
                className="sprout-button"
                onClick={() => navigate("/create-profile")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Profile
              </Button>
            </div>

            {childProfiles.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Child Profiles Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create a profile to track your child's emotional learning journey
                    </p>
                    <Button
                      className="sprout-button"
                      onClick={() => navigate("/create-profile")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {childProfiles.map((profile) => (
                  <Card key={profile.id} className={
                    profile.id === currentChildId
                      ? "border-2 border-sprout-purple"
                      : ""
                  }>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <CardTitle className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={getAvatarImage(profile.avatar)} alt={profile.nickname} />
                            <AvatarFallback>{profile.nickname.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {profile.nickname}
                        </CardTitle>
                        <div className="flex gap-2">
                          {profile.id === currentChildId && (
                            <Badge variant="outline" className="bg-sprout-purple text-white">
                              Active Profile
                            </Badge>
                          )}
                          {profile.creationStatus && (
                            <Badge className={profile.creationStatus === 'completed' ? 'bg-green-500' : 'bg-amber-500'}>
                              {profile.creationStatus === 'completed' ? 'Complete' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        Age: {profile.age} • Grade: {profile.grade}
                        {profile.gender && ` • Gender: ${profile.gender}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Learning Styles</h4>
                            <p>
                              {profile.learningStyles && profile.learningStyles.length > 0 
                                ? profile.learningStyles.map(style => getLearningStyleLabel(style)).join(", ")
                                : "Not specified"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">SEL Strengths</h4>
                            <p>
                              {profile.selStrengths && profile.selStrengths.length > 0 
                                ? profile.selStrengths.map(strength => getSELStrengthLabel(strength)).join(", ")
                                : "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Interests</h4>
                          <p>{formatArrayToString(profile.interests)}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Story Preferences</h4>
                          <p>{formatArrayToString(profile.storyPreferences)}</p>
                        </div>

                        {profile.selChallenges && profile.selChallenges.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">SEL Challenges</h4>
                            <p>{formatArrayToString(profile.selChallenges)}</p>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Relationship to Parent</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                setEditChildRelationship(profile.id);
                                setRelationshipValue(profile.relationshipToParent || "");
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <p>{profile.relationshipToParent || "Not specified"}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          {profile.id !== currentChildId && (
                            <Button
                              variant="outline"
                              onClick={() => setCurrentChildId(profile.id)}
                              className="text-sprout-purple border-sprout-purple hover:bg-sprout-purple/10"
                            >
                              Make Active
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/edit-profile/${profile.id}`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="parent">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Parent Information</CardTitle>
                    <CardDescription>
                      Your contact information and account details
                    </CardDescription>
                  </div>
                  {!editParentMode && (
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
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Name</h3>
                          <p className="text-lg">{parentInfo.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Relationship to Child</h3>
                          <p className="text-lg">{parentInfo.relationship || "Parent"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="text-lg">{parentInfo.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                          <p className="text-lg">
                            {parentInfo.emergencyContact || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            parentForm.reset({
                              name: parentInfo.name,
                              email: parentInfo.email,
                              relationship: parentInfo.relationship,
                              emergencyContact: parentInfo.emergencyContact || "",
                            });
                            setEditParentMode(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Information
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // This would open password change in a real app
                            toast({
                              title: "Change Password",
                              description: "This feature is coming soon!",
                            });
                          }}
                        >
                          Change Password
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No parent information available. Please add your information.</p>
                      <Button onClick={() => setEditParentMode(true)} className="sprout-button">
                        Add Parent Information
                      </Button>
                    </div>
                  )
                ) : (
                  <Form {...parentForm}>
                    <form onSubmit={parentForm.handleSubmit(saveParentProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={parentForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
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
                              <FormLabel>Email</FormLabel>
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
                              <FormLabel>Relationship to Child</FormLabel>
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
                              <FormLabel>Emergency Contact</FormLabel>
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
                          onClick={() => setEditParentMode(false)}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the child profile
                and all associated journal entries and progress data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Dialog open={!!editChildRelationship} onOpenChange={(open) => !open && setEditChildRelationship(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Relationship</DialogTitle>
              <DialogDescription>
                Define the relationship between this child and the parent
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={relationshipValue}
                onValueChange={setRelationshipValue}
              >
                <SelectTrigger id="relationship" className="w-full">
                  <SelectValue placeholder="Select a relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Son">Son</SelectItem>
                  <SelectItem value="Daughter">Daughter</SelectItem>
                  <SelectItem value="Stepchild">Stepchild</SelectItem>
                  <SelectItem value="Foster Child">Foster Child</SelectItem>
                  <SelectItem value="Grandchild">Grandchild</SelectItem>
                  <SelectItem value="Nephew">Nephew</SelectItem>
                  <SelectItem value="Niece">Niece</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditChildRelationship(null)}
              >
                Cancel
              </Button>
              <Button 
                className="sprout-button" 
                onClick={handleRelationshipSave}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Profile;
