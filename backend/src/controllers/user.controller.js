import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //* Don't show the user in recommended list
        { _id: { $nin: currentUser.friends } }, //* Don't show the user's friends in recommended list
        { _id: { $nin: currentUser.sentFriendRequests } }, //* Don't show the users that the user has sent friend requests to
        { $id: { $nin: currentUser.friends } }, // * Don't show the users that the user has received friend requests from
        { isOnboarded: true }, //* Only show users who have completed onboarding
      ],
    });

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePicture nativeLanguage, learningLanguage"
      );

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recepientId } = req.params;

    //* Preventing sending friend request to yourself
    if (myId === recepientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }

    const recpient = await User.findById(recepientId);
    if (!recpient) {
      return res.status(404).json({ message: "Recpient not found." });
    }

    if (recpient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    //* To check if the request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recepientId },
        { sender: recepientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({
          message: "A friend request already exists between you and this user.",
        });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recepientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try{
    const{id:requestId} = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if(!friendRequest){
      return res.status(404).json({message: "Friend request not found."});
    }

    if(friendRequest.recipient.toString() !== req.user.id){
      return res.status(403).json({message: "You are not authorized to accept this friend request."});
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to each other's friends list
    // $addToSet is used to add a value to an array only if it doesn't already exist in the array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });
    
    res.status(200).json({message: "Friend request accepted."});
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}