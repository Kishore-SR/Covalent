import { Link } from "react-router";
import { MessageSquareIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  // Add a null check to prevent errors with deleted users
  if (!friend || !friend._id || !friend.username || !friend.profilePic) {
    return null;
  }

  return (
    <div className="card border border-primary/25 bg-base-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}{" "}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={`@${friend.username}`} />
          </div>
          <div>
            <h3 className="font-semibold truncate font-mono">
              @{friend.username}
            </h3>
          </div>
        </div>{" "}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.currentFocus || "Unknown")}
            Current Focus: {friend.currentFocus || "Unknown"}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.skillTrack || "Unknown")}
            Skill Track: {friend.skillTrack || "Unknown"}
          </span>
        </div>
        <Link to={`/chat/${friend._id}`} className="btn btn-success btn-sm">
          <MessageSquareIcon className="h-4 w-4 mr-1" />
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  // Return null to remove all flag/icon symbols
  return null;
}
