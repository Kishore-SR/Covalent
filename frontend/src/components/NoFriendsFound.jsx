import { UserX2Icon } from "lucide-react";

const NoFriendsFound = () => {
  return (
    <div className="card bg-base-200 p-6 text-center">
      <UserX2Icon className="mx-auto h-8 w-8 text-base-content/30" />
      <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
      <p className="text-base-content opacity-70">
        Connect with passionate learners below and build strong bonds!
      </p>
    </div>
  );
};

export default NoFriendsFound;
