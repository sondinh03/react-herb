import { useCallback } from "react";

export function useAuth() {
  const getAuthToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }, []);
  return { getAuthToken };
}
