
import React, { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import ChildProfilesTab from "./ChildProfilesTab";
import ParentInfoTab from "./ParentInfoTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserPlus, UserCog } from "lucide-react";

const ProfileLayout = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("children");
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="bg-gradient-to-r from-sprout-purple/20 to-sprout-cream rounded-lg p-6 mb-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-left text-sprout-purple">Profiles</h1>
          <p className="text-gray-600 mb-0 text-left">
            Manage child profiles and parent information
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-6 sm:space-y-8"
        >
          <TabsList className="w-full grid grid-cols-2 mb-6 bg-sprout-cream p-1 border border-sprout-purple/20">
            <TabsTrigger 
              value="children" 
              className="data-[state=active]:bg-white data-[state=active]:text-sprout-purple flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Child Profiles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="parent" 
              className="data-[state=active]:bg-white data-[state=active]:text-sprout-purple flex items-center justify-center gap-2"
            >
              <UserCog className="h-4 w-4" />
              <span>Parent Information</span>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {activeTab === "children" && <ChildProfilesTab key="children-tab" />}
            {activeTab === "parent" && <ParentInfoTab key="parent-tab" />}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfileLayout;
