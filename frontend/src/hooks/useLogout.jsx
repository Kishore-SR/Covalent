import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import { useNavigate } from "react-router"; // Import navigation

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // For navigation after logout

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear user data from cache
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      // Clear token from localStorage
      localStorage.removeItem("token");

      // Force redirect to login page
      navigate("/login");
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
