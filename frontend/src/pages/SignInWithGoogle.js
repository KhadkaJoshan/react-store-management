import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <h1 style={{ color: "green" }}>Welcome to Inventory Management System</h1>
      <button onClick={() => loginWithRedirect()}>Log In</button>;
    </div>
  );
};

export default LoginButton;
