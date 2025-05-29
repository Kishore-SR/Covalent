import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  InfoIcon,
} from "lucide-react";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { capitialize } from "../lib/utils";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [incomingRequestsMap, setIncomingRequestsMap] = useState(new Map());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: sendRequestMutation, isPending: sendingRequest } =
    useMutation({
      mutationFn: sendFriendRequest,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
    });

  const { mutate: acceptRequestMutation, isPending: acceptingRequest } =
    useMutation({
      mutationFn: acceptFriendRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
    });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  useEffect(() => {
    const incomingReqsMap = new Map();
    if (
      friendRequests?.incomingReqs &&
      friendRequests.incomingReqs.length > 0
    ) {
      friendRequests.incomingReqs.forEach((req) => {
        incomingReqsMap.set(req.sender._id, req._id);
      });
    }
    setIncomingRequestsMap(incomingReqsMap);
  }, [friendRequests]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {" "}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Network
          </h2>
          {/* <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link> */}
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="card bg-base-200 hover:shadow-lg transition-all duration-300 group relative"
              >
                {friend.bio && (
                  <div className="dropdown dropdown-hover dropdown-end absolute right-2 top-2 z-10">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-base-content"
                    >
                      <InfoIcon className="size-4" />
                    </label>{" "}
                    <div className="dropdown-content z-[1] card card-compact w-60 shadow-lg bg-base-100 text-base-content border-2 border-primary/20">
                      <div className="card-body">
                        <p className="text-sm">{friend.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
                <FriendCard friend={friend} />
              </div>
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                {" "}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet Engineering Professionals
                </h2>{" "}
                <p className="opacity-70">
                  Discover professionals in engineering based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>{" "}
              <p className="text-base-content opacity-70">
                Check back later for new engineering partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                const incomingRequestId = incomingRequestsMap.get(user._id);
                const hasIncomingRequest = !!incomingRequestId;

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      {" "}
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img
                            src={user.profilePic}
                            alt={`@${user.username}`}
                          />
                        </div>{" "}
                        <div>
                          <h3 className="font-semibold text-lg font-mono">
                            @{user.username}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>{" "}
                      {/* Skills with icons */}{" "}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.currentFocus)}
                          Current Focus: {capitialize(user.currentFocus)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.skillTrack)}
                          Skill Track: {capitialize(user.skillTrack)}
                        </span>{" "}
                      </div>
                      {user.bio && (
                        <div className="border-l-2 border-base-300 pl-3">
                          <p className="text-sm opacity-70 line-clamp-2">
                            {user.bio}
                          </p>
                        </div>
                      )}
                      {/* Action button */}
                      {hasIncomingRequest ? (
                        <button
                          className="btn btn-accent w-full mt-2"
                          onClick={() =>
                            acceptRequestMutation(incomingRequestId)
                          }
                          disabled={acceptingRequest}
                        >
                          <UserCheckIcon className="size-4 mr-2" />
                          Accept Request
                        </button>
                      ) : (
                        <button
                          className={`btn w-full mt-2 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          } `}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || sendingRequest}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className="size-4 mr-2" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="size-4 mr-2" />
                              Send Friend Request
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
