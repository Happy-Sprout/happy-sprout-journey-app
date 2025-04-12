
import React, { ReactNode } from "react";
import { AuthProvider } from "@/hooks/auth";
import { ParentProvider } from "@/providers/ParentProvider";
import { ChildrenProvider } from "@/hooks/useChildren";

// UserProvider combines all providers and ensures proper nesting order
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
