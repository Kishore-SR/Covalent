import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import toast from "react-hot-toast";

const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store token in localStorage if it exists in the response
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Login successful");
    },
    onError: (error) => {
      console.error("Login error:", error);

      // Handle specific error cases
      if (error.response?.data?.error === "ENV_VAR_MISSING") {
        toast.error("Server configuration error. Please contact support.");
      } else {
        toast.error(
          error.response?.data?.message || "Login failed. Please try again."
        );
      }
    },
  });

  return { isPending, error, loginMutation: mutate };
};

export default useLogin;
