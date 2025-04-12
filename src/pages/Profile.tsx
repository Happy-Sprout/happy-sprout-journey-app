
import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";

const Profile = () => {
  // Set the document title directly
  React.useEffect(() => {
    document.title = "Profile | Happy Sprout";
    return () => {
      // Cleanup when component unmounts
      document.title = "Happy Sprout";
    };
  }, []);

  return (
    <>
      <ProfileLayout />
    </>
  );
};

export default Profile;
