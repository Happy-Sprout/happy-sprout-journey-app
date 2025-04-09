
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import ChildProfilesTab from "./ChildProfilesTab";
import ParentInfoTab from "./ParentInfoTab";

const ProfileLayout = () => {
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
            <ChildProfilesTab />
          </TabsContent>

          <TabsContent value="parent">
            <ParentInfoTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfileLayout;
