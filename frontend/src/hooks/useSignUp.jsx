import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
import toast from "react-hot-toast";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      // Store token in localStorage if it exists in the response
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Sign up successful!");
    },
    onError: (error) => {
      console.error("Signup error:", error);

      // Handle specific error cases
      if (error.response?.data?.error === "ENV_VAR_MISSING") {
        toast.error("Server configuration error. Please contact support.");
      } else {
        toast.error(
          error.response?.data?.message || "Sign up failed. Please try again."
        );
      }
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
