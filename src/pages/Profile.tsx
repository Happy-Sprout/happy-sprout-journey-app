
import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { Helmet } from "react-helmet";

const Profile = () => {
  // Set the document title directly as a fallback in case Helmet has issues
  React.useEffect(() => {
    document.title = "Profiles | Happy Sprout";
    return () => {
      // Cleanup when component unmounts
      document.title = "Happy Sprout";
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Profiles | Happy Sprout</title>
      </Helmet>
      <ProfileLayout />
    </>
  );
};

export default Profile;
