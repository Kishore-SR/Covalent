import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { Atom, BellIcon, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { getFriendRequests } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const isNotificationsPage = location.pathname === "/notifications";
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const { logoutMutation } = useLogout();

  // Fetch notifications
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  // Store which notifications have been seen
  const [viewedAcceptedIds, setViewedAcceptedIds] = useState([]);

  useEffect(() => {
    if (friendRequests) {
      const incomingCount = friendRequests.incomingReqs?.length || 0;

      // Only count accepted requests that haven't been viewed yet
      const newAcceptedReqs =
        friendRequests.acceptedReqs?.filter(
          (req) => !viewedAcceptedIds.includes(req._id)
        ) || [];
      const acceptedCount = newAcceptedReqs.length;

      const totalCount = incomingCount + acceptedCount;
      setNotificationCount(totalCount);
      setShowNotificationBadge(totalCount > 0 && !isNotificationsPage);
    }
  }, [friendRequests, isNotificationsPage, viewedAcceptedIds]);

  // Handle navigation to notifications page
  useEffect(() => {
    if (isNotificationsPage && friendRequests) {
      // Mark all current accepted requests as viewed
      const acceptedIds =
        friendRequests.acceptedReqs?.map((req) => req._id) || [];
      if (acceptedIds.length > 0) {
        setViewedAcceptedIds((prev) => [...prev, ...acceptedIds]);
      }
      // Hide badge while on notifications page
      setShowNotificationBadge(false);
    }
  }, [isNotificationsPage, friendRequests]);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ----- Mobile Layout (profile left, icons right) ----- */}
        <div className="flex items-center justify-between w-full sm:hidden">
          {/* Profile pic on left */}
          <Link to="/">
            <div className="flex rows items-center gap-2">
              <div className="avatar">
                <div className="w-11 rounded-full border border-base-800">
                  <img
                    src={authUser?.profilePic}
                    alt="User Avatar"
                    rel="noreferrer"
                  />
                </div>
              </div>
              {/* Display username in mobile view */}
              <div className="mr-2">
                <div className="text-sm font-mono font-semibold opacity-80">
                  @{authUser?.username || ""}
                </div>
              </div>
            </div>
          </Link>{" "}
          {/* Right side icons */}
          <div className="flex items-center gap-1">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {showNotificationBadge && (
                  <span className="absolute -top-0 -right-0 bg-error text-error-content text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            </Link>

            <ThemeSelector />

            <button
              className="btn btn-ghost btn-circle"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>

        {/* ----- Desktop Layout ----- */}
        <div className="hidden sm:flex items-center justify-end w-full">
          {/* Logo - only in the chat page */}
          {isChatPage && (
            <div className="pl-5 mr-auto">
              <Link to="/" className="flex items-center gap-2.5">
                <Atom className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Covalent
                </span>
              </Link>
            </div>
          )}{" "}
          {/* Right-side icons */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {showNotificationBadge && (
                  <span className="absolute -top-0 -right-0 bg-error text-error-content text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            </Link>

            <ThemeSelector />

            <button
              className="btn btn-ghost btn-circle"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
