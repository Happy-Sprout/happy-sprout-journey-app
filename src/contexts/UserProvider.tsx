
import React, { ReactNode } from "react";
import { AuthProvider } from "@/hooks/auth";
import { ParentProvider } from "@/providers/ParentProvider";
import { ChildrenProvider } from "@/hooks/useChildren";

// Ensure consistent provider nesting with proper initialization
export const UserProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ParentProvider>
        <ChildrenProvider>
          {children}
        </ChildrenProvider>
      </ParentProvider>
    </AuthProvider>
  );
};

export default UserProvider;
