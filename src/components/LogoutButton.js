import React from "react";
import { logoutUser } from "../firebase-auth";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      alert("You have successfully logged out!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
