
import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ParentProvider } from "@/hooks/useParent";
import { ChildrenProvider } from "@/hooks/useChildren";
import { useUser } from "@/hooks/useUser";

// Re-export the hook for backward compatibility
export { useUser };

// Re-export types for backward compatibility
export type { ParentInfo } from "@/hooks/useParent";
export type { ChildProfile as ChildProfile } from "@/hooks/useChildren";

// Combine all providers into a single UserProvider component
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
