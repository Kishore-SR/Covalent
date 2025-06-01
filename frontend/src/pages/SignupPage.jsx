import { useState, useEffect } from "react";
import { Atom, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import emailjs from "emailjs-com";
import { toast } from "react-hot-toast";
import useSignUp from "../hooks/useSignUp.jsx";
import { useThemeStore } from "../store/useThemeStore";
import { USERNAME_ADJECTIVES, USERNAME_CHARACTERS } from "../constants";
import { checkUsernameExists } from "../lib/api";
import { Helmet } from "react-helmet-async";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    username: "", // Username field only
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Function to generate a random username
  const generateRandomUsername = () => {
    const randomAdjective =
      USERNAME_ADJECTIVES[
        Math.floor(Math.random() * USERNAME_ADJECTIVES.length)
      ];
    const randomCharacter =
      USERNAME_CHARACTERS[
        Math.floor(Math.random() * USERNAME_CHARACTERS.length)
      ];
    return `${randomAdjective}${randomCharacter}`;
  };

  // Function to check if username exists and generate a new one if needed
  const generateUniqueUsername = async () => {
    let isUnique = false;
    let username = "";
    let attempts = 0;

    // Try up to 5 times to get a unique username
    while (!isUnique && attempts < 5) {
      attempts++;
      username = generateRandomUsername();

      try {
        const response = await checkUsernameExists(username);
        isUnique = !response.exists;
      } catch (error) {
        console.error("Error checking username:", error);
        // If there's an error, we'll assume it's unique and let the server validate
        isUnique = true;
      }
    }

    return username;
  };

  // Generate a username on component mount
  useEffect(() => {
    const initUsername = async () => {
      const username = await generateUniqueUsername();
      setSignupData((prev) => ({ ...prev, username }));
    };

    initUsername();
  }, []);
  // Function to regenerate username
  const handleRegenerateUsername = async () => {
    try {
      setIsRotating(true);
      const newUsername = await generateUniqueUsername();
      setSignupData((prev) => ({ ...prev, username: newUsername }));
      toast.success("New unique username generated!");
    } catch (error) {
      toast.error("Failed to generate a unique username. Please try again.");
    } finally {
      // Add a slight delay before stopping the rotation for a smoother effect
      setTimeout(() => {
        setIsRotating(false);
      }, 500);
    }
  };

  const SERVICE_ID = "service_y948zbh";
  const TEMPLATE_ID = "template_cmwny1k";
  const PUBLIC_KEY = "ZZ8_It-Lgh_UyXn65";

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };
  const sendOTP = async (email, otp) => {
    const templateParams = {
      to_email: email,
      otp: otp,
      full_name: signupData.username,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      toast.success("OTP sent successfully to your mail.");
    } catch (error) {
      console.error("EmailJS Error:", error);
      throw new Error("Failed to send OTP to your mail.");
    }
  };

  const { isPending, error, signupMutation } = useSignUp();
  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate password length before sending request
    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve, reject) => {
        signupMutation(signupData, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        });
      });

      const otp = generateOTP();
      localStorage.setItem("signup_otp", otp);
      localStorage.setItem("signup_email", signupData.email);

      await sendOTP(signupData.email, otp);
      navigate("/verify-otp");
    } catch (err) {
      // Only show one toast for any error
      const errorMessage =
        err?.response?.data?.message || err.message || "Signup failed";

      // Check for common errors and format message
      if (errorMessage.includes("E11000") && errorMessage.includes("email")) {
        toast.error(
          "Email already exists. Please use a different email address."
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const { theme } = useThemeStore();
  return (
    <div className="flex h-screen">
      {" "}
      <Helmet>
        <title>Signup | Covalent</title>
        <meta
          name="description"
          content="Join Covalent - Where engineering students connect anonymously and build strong bonds through passion and purpose."
        />
      </Helmet>
      <div
        className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8"
        data-theme={theme}
      >
        <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
          {/* LEFT - Form */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
            <div className="mb-4 flex items-center justify-start gap-2">
              <Atom className="size-9 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Covalent
              </span>
            </div>

            <div className="w-full">
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-mono">Create an Account</h2>
                    <p className="text-sm opacity-70">
                      Join the future engineers who value passion over identity
                    </p>
                  </div>{" "}
                  <div className="space-y-3">
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Username</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered w-full font-mono"
                          value={signupData.username || "Generating..."}
                          readOnly
                          required
                        />{" "}
                        <button
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={handleRegenerateUsername}
                          title="Generate new username"
                          disabled={!signupData.username || isRotating}
                        >
                          <RefreshCw
                            className={`h-5 w-5 ${
                              !signupData.username || isRotating
                                ? "animate-spin"
                                : ""
                            } transition-all duration-300`}
                          />
                        </button>
                      </div>{" "}
                      <p className="text-xs opacity-70 mt-1">
                        You'll stay anonymous, this fun name will be your
                        identity!
                      </p>
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        className="input input-bordered w-full"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <input
                        type="password"
                        placeholder="∗∗∗∗∗∗"
                        className="input input-bordered w-full"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-xs opacity-70 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          required
                        />
                        <span className="text-xs leading-tight">
                          I agree to the{" "}
                          <span className="text-primary hover:underline">
                            terms of service
                          </span>{" "}
                          and{" "}
                          <span className="text-primary hover:underline">
                            privacy policy
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={isLoading || isPending}
                  >
                    {isLoading || isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs font-mono"></span>
                        Sending OTP...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT - Image and info */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
            <div className="max-w-md p-8">
              <div className="relative aspect-square max-w-sm mx-auto">
                <img
                  src="/signup.png"
                  alt="Engineering connection"
                  className="w-full h-full"
                />
              </div>
              <div className="text-center space-y-3 mt-6">
                <h2 className="text-xl font-semibold">
                  You’re not the only one chasing dreams
                </h2>{" "}
                <p className="opacity-70">
                  Find like-minded students, collaborate on ideas and level up
                  without revealing your identity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
