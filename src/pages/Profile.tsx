
import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { Helmet } from "react-helmet";

const Profile = () => {
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
