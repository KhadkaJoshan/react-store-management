import React from "react";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button className="btn btn-primary" onClick={() => logout()}>
      Log Out
    </button>
  );
};

export default LogoutButton;
