import { useAuthContext } from "@/context/auth-context";

/** Access auth state + actions. Must be used inside <AuthProvider>. */
export function useAuth() {
  return useAuthContext();
}
