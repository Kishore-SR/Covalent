import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { getUserFriends, getStreamToken } from "../lib/api";
import { getLanguageFlag } from "../components/FriendCard";
import toast from "react-hot-toast";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import {
  MessageSquareIcon,
  VideoIcon,
  UserX2Icon,
  SearchIcon,
  UsersIcon,
  FilterIcon,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const FriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    onSuccess: (data) => console.log("Friends data:", data),
  });

  // Fetch Stream token for video calls
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" ||
      friend.currentFocus.toLowerCase() === selectedLanguage.toLowerCase() ||
      friend.skillTrack.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });
  const languages = [
    ...new Set(
      friends.flatMap((friend) =>
        [friend.currentFocus, friend.skillTrack].filter(Boolean)
      )
    ),
  ];

  const handleVideoCall = async (friend) => {
    if (!authUser || !tokenData?.token) {
      toast.error("You need to be logged in to start a call");
      return;
    }

    try {
      const client = StreamChat.getInstance(STREAM_API_KEY);

      await client.connectUser(
        {
          id: authUser._id,
          name: authUser.username,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      // Create channel ID same way as in ChatPage
      const channelId = [authUser._id, friend._id].sort().join("-");

      // Create the call URL
      const callUrl = `${window.location.origin}/call/${channelId}`;

      // Create a temporary channel to send the message
      const channel = client.channel("messaging", channelId, {
        members: [authUser._id, friend._id],
      });

      await channel.watch();

      // Send the call link message
      await channel.sendMessage({
        text: `I've started a video call. Join here: \n ${callUrl}`,
      });

      // Show success toast with friend's name
      toast.success(
        `Video call started! Share this link with @${friend.username}`
      );
      // Open the call in a new window/tab
      window.open(callUrl, "_blank");

      // Clean up
      await client.disconnectUser();
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not start video call. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <Helmet>
        <title>Friends | Covalent</title>
        <meta
          name="description"
          content="Connect with your engineering friends on Covalent."
        />
      </Helmet>
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {" "}
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <UsersIcon className="text-primary h-7 w-7" />
              Your Network
              <span className="badge badge-primary ml-2">{friends.length}</span>
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Connect and collaborate with your engineering partners
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-base-200 rounded-xl p-4 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 h-5 w-5" />
              <input
                type="text"
                placeholder="Search friends by name..."
                className="input input-bordered w-full pl-10 bg-base-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4" />
              Filter
            </button>
          </div>{" "}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-base-300">
              <span className="text-sm font-medium mr-2">
                Filter by focus/track:
              </span>
              <button
                className={`btn btn-sm ${
                  selectedLanguage === "all" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setSelectedLanguage("all")}
              >
                All
              </button>
              {languages.map((language) => (
                <button
                  key={language}
                  className={`btn btn-sm ${
                    selectedLanguage === language.toLowerCase()
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  onClick={() => setSelectedLanguage(language.toLowerCase())}
                >
                  {getLanguageFlag(language)} {language}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Friend cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-16 bg-base-200 rounded-xl shadow-inner">
            <UserX2Icon className="mx-auto h-16 w-16 text-base-content/30" />
            <h3 className="mt-4 text-xl font-semibold">No friends found</h3>
            <p className="mt-2 text-base-content/70">
              {searchTerm || selectedLanguage !== "all"
                ? "Try changing your search or filter settings"
                : "Connect with like-minded learners to see them here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex bg-base-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-l-4 border-primary"
              >
                {/* Profile Picture Column */}
                <div className="w-1/3 bg-gradient-to-br from-primary/20 to-secondary/20 p-6 flex items-center justify-center">
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={friend.profilePic}
                        alt={friend.username}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Content Column */}
                <div className="w-2/3 p-6">
                  <div className="flex flex-col h-full justify-between">
                    {/* User Info */}
                    <div>
                      <h3 className="text-xl font-bold">@{friend.username}</h3>
                      {friend.bio && (
                        <div className="mt-2 mb-3 bg-base-100 rounded-lg p-2 border-l-2 border-secondary">
                          <p className="text-sm italic opacity-80">
                            "{friend.bio}"
                          </p>
                        </div>
                      )}{" "}
                      <div className="flex flex-wrap gap-3 mt-3 mb-4">
                        <div className="flex items-center text-sm">
                          <span className="mr-1 text-opacity-70">Focus:</span>
                          {getLanguageFlag(friend.currentFocus)}
                          <span className="font-medium">
                            {friend.currentFocus}
                          </span>
                        </div>
                        <span className="text-xs opacity-50">•</span>
                        <div className="flex items-center text-sm">
                          <span className="mr-1 text-opacity-70">Track:</span>
                          {getLanguageFlag(friend.skillTrack)}
                          <span className="font-medium">
                            {friend.skillTrack}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-8">
                      <Link
                        to={`/chat/${friend._id}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <MessageSquareIcon className="h-4 w-4 mr-2" />
                        Chat
                      </Link>
                      {/* Updated video call button */}
                      <button
                        onClick={() => handleVideoCall(friend)}
                        className="btn btn-outline btn-sm flex-1"
                      >
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
