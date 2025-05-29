import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api.js";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
} from "lucide-react";
import { FOCUS_AREAS, SKILL_TRACKS } from "../constants";
import { useThemeStore } from "../store/useThemeStore";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    bio: authUser?.bio || "",
    currentFocus: authUser?.nativeLanguage || "",
    skillTrack: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };
  const { theme } = useThemeStore();

  return (
    <div
      className="min-h-screen bg-base-100 flex items-center justify-center p-4"
      data-theme={theme}
    >
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>{" "}
            </div>

            {/* USERNAME DISPLAY */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                <p className="font-mono font-semibold">@{authUser?.username}</p>
                <p className="text-xs opacity-70 mt-1">
                  Your unique username cannot be changed
                </p>
              </div>
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your engineering goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}{" "}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Focus</span>
                </label>
                <select
                  name="currentFocus"
                  value={formState.currentFocus}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      currentFocus: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your current focus</option>
                  {FOCUS_AREAS.map((focus) => (
                    <option key={`focus-${focus}`} value={focus.toLowerCase()}>
                      {focus}
                    </option>
                  ))}
                </select>
              </div>
              {/* SKILL TRACK */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Skill Track</span>
                </label>
                <select
                  name="skillTrack"
                  value={formState.skillTrack}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      skillTrack: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your skill track</option>
                  {SKILL_TRACKS.map((track) => (
                    <option key={`track-${track}`} value={track.toLowerCase()}>
                      {track}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
