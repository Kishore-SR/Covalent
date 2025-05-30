import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");

    // If we have user data, map backend field names to our new field names
    if (res.data) {
      return {
        ...res.data,
        // Map backend fields to our new field names in the frontend
        currentFocus: res.data.nativeLanguage,
        skillTrack: res.data.learningLanguage,
      };
    }

    return res.data;
  } catch (error) {
    console.error("Error in getAuthUser:", error);

    // Check if there's a specific error from the backend
    if (error.response?.data?.error === "ENV_VAR_MISSING") {
      throw new Error("Server configuration error");
    }

    return null;
  }
};

export const completeOnboarding = async (userData) => {
  // Map new field names to the backend field names
  const mappedUserData = {
    ...userData,
    // Map currentFocus to nativeLanguage for the backend
    nativeLanguage: userData.currentFocus,
    // Map skillTrack to learningLanguage for the backend
    learningLanguage: userData.skillTrack,
  };

  const response = await axiosInstance.post("/auth/onboarding", mappedUserData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");

  // Map the backend field names to our new frontend field names for each friend
  if (response.data && Array.isArray(response.data)) {
    return response.data.map((friend) => ({
      ...friend,
      currentFocus: friend.nativeLanguage,
      skillTrack: friend.learningLanguage,
    }));
  }

  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");

  // Map the backend field names to our new frontend field names for each user
  if (response.data && Array.isArray(response.data)) {
    return response.data.map((user) => ({
      ...user,
      currentFocus: user.nativeLanguage,
      skillTrack: user.learningLanguage,
    }));
  }

  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-request");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-request");

  // Map the backend field names for each request sender
  if (response.data) {
    // Handle incoming requests
    if (
      response.data.incomingReqs &&
      Array.isArray(response.data.incomingReqs)
    ) {
      response.data.incomingReqs = response.data.incomingReqs.map((req) => ({
        ...req,
        sender: {
          ...req.sender,
          currentFocus: req.sender.nativeLanguage,
          skillTrack: req.sender.learningLanguage,
        },
      }));
    }

    // Handle accepted requests
    if (
      response.data.acceptedReqs &&
      Array.isArray(response.data.acceptedReqs)
    ) {
      response.data.acceptedReqs = response.data.acceptedReqs.map((req) => ({
        ...req,
        sender: {
          ...req.sender,
          currentFocus: req.sender.nativeLanguage,
          skillTrack: req.sender.learningLanguage,
        },
      }));
    }
  }

  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// Check if username exists in the database
export const checkUsernameExists = async (username) => {
  try {
    const response = await axiosInstance.get(
      `/auth/check-username/${username}`
    );
    return response.data;
  } catch (error) {
    // If error status is 409, username exists
    if (error.response && error.response.status === 409) {
      return { exists: true };
    }
    throw error;
  }
};
