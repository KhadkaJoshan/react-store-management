import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

function AddUser() {
  const { user } = useAuth0();
  const dummyUser = [
    { email: "khadkajosan@gmail.com", name: "khadkajosan@gmail.com" },
    { email: "jkhadka2049@gmail.com", name: "jkhadka2049@gmail.com" },
  ];
  const isPresent = dummyUser.some(
    (item) => item.email === user.email && item.name === user.name
  );

  return isPresent;
}

export default AddUser;
