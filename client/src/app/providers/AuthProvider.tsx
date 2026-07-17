import { createContext } from "react";
import type { PropsWithChildren } from "react";

import { authClient } from "@/shared/lib/auth-client";

type AuthContextType = ReturnType<typeof authClient.useSession>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const session = authClient.useSession();

  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
}