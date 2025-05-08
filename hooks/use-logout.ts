import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useLogout() {
    const router = useRouter();
  
    const logout = useCallback(async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (token) {
          await fetchApi<HerbResponse<boolean>>("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
  
        // Clear localStorage regardless of API success
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
  
        // Redirect to home page
        router.push("/");
      } catch (error) {
        console.error("Logout failed:", error);
        // Clear localStorage and redirect even if API call fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        router.push("/");
      }
    }, [router]);
  
    return logout;
  }