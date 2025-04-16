
import React, { useEffect } from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { useUser } from "@/contexts/UserContext";
import NoActiveProfilePrompt from "@/components/daily-check-in/NoActiveProfilePrompt";

const Profile = () => {
  // Set the document title directly
  useEffect(() => {
    document.title = "Profile | Happy Sprout";
    return () => {
      // Cleanup when component unmounts
      document.title = "Happy Sprout";
    };
  }, []);

  // Get user context to check if there's a current child selected
  const { currentChildId } = useUser();

  return (
    <>
      <ProfileLayout />
    </>
  );
};

export default Profile;
