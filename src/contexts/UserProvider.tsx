
import React, { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ParentProvider } from "@/hooks/useParent";
import { ChildrenProvider } from "@/hooks/useChildren";

// UserProvider combines all providers for backward compatibility
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
