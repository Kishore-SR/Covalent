import React from "react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { authUser } = useAuth();

  return (
    <div className="sidebar">
      <div className="user-info">
        <img
          src={authUser?.profilePicture}
          alt="Profile"
          className="profile-picture"
        />
        <p className="font-semibold text-sm">@{authUser?.username}</p>
      </div>
      <nav>
        <ul>
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/settings">Settings</a>
          </li>
          <li>
            <a href="/logout">Logout</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
