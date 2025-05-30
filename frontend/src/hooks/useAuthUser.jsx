import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          // Return early if no token is found
          return { user: null };
        }
        
        // Call the API with the token
        return await getAuthUser();
      } catch (error) {
        console.error("Error in getAuthUser:", error);
        // If there's an unauthorized error, clear the token
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
        }
        throw error;
      }
    },
    retry: false, // auth check only once
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    isLoading: authUser.isLoading,
    authUser: authUser.data?.user,
    error: authUser.error
  };
};

export default useAuthUser;
