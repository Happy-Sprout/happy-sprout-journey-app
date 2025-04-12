
import React, { useCallback, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import ChildProfilesTab from "./ChildProfilesTab";
import ParentInfoTab from "./ParentInfoTab";
import { useIsMobile } from "@/hooks/use-mobile";

const ProfileLayout = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("children");
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);
  
  // Only render the tab content when it's active - prevents unnecessary fetch calls
  const tabContent = useMemo(() => {
    if (activeTab === "children") {
      return <ChildProfilesTab key="children-tab" />;
    } else if (activeTab === "parent") {
      return <ParentInfoTab key="parent-tab" />;
    }
    return null;
  }, [activeTab]);
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-left">Profiles</h1>
        <p className="text-gray-600 mb-6 sm:mb-8 text-left">
          Manage child profiles and parent information
        </p>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-6 sm:space-y-8"
        >
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="children">Child Profiles</TabsTrigger>
            <TabsTrigger value="parent">Parent Information</TabsTrigger>
          </TabsList>

          {/* Simplified tab content rendering with single element */}
          <div className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {tabContent}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default React.memo(ProfileLayout);
