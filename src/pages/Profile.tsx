
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
import { Edit, Plus, Trash2, UserCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { avatarOptions } from "@/constants/profileOptions";
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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    childProfiles, 
    deleteChildProfile, 
    parentInfo, 
    currentChildId, 
    setCurrentChildId,
    getCurrentChild
  } = useUser();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

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
                                : getLearningStyleLabel(profile.learningStyle)}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">SEL Strengths</h4>
                            <p>
                              {profile.selStrengths && profile.selStrengths.length > 0 
                                ? profile.selStrengths.map(strength => getSELStrengthLabel(strength)).join(", ")
                                : getSELStrengthLabel(profile.strongestSEL)}
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
                <CardTitle>Parent Information</CardTitle>
                <CardDescription>
                  Your contact information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parentInfo ? (
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
                          // This would open an edit form in a real app
                          toast({
                            title: "Edit Profile",
                            description: "This feature is coming soon!",
                          });
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
                    <p className="text-gray-500 mb-4">Parent information not available</p>
                  </div>
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
      </div>
    </Layout>
  );
};

export default Profile;
