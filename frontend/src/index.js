import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Auth0Provider } from "@auth0/auth0-react";

// Normalize hostname from localhost to 127.0.0.1 to match Auth0 Allowed Callback URL
if (
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  (process.env.REACT_APP_AUTH0_REDIRECT_URI || "").includes("127.0.0.1")
) {
  window.location.replace(window.location.href.replace("//localhost:", "//127.0.0.1:"));
}

// Ignore stale CRA cached env if server was not restarted
const AUTH0_DOMAIN =
  process.env.REACT_APP_AUTH0_DOMAIN &&
  process.env.REACT_APP_AUTH0_DOMAIN !== "dev-upgx8ncyk5imxh0b.us.auth0.com"
    ? process.env.REACT_APP_AUTH0_DOMAIN
    : "dev-cuxo3uboupppygbb.us.auth0.com";

const AUTH0_CLIENT_ID =
  process.env.REACT_APP_AUTH0_CLIENT_ID &&
  process.env.REACT_APP_AUTH0_CLIENT_ID !== "vu6QU9Rx2C3yoNJYkAF9EETAY9Ltm2tl"
    ? process.env.REACT_APP_AUTH0_CLIENT_ID
    : "3MjnrJPwYiky6ylFURKr4Ahj45XHtTOl";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: process.env.REACT_APP_AUTH0_REDIRECT_URI || "https://127.0.0.1:3000/viewproducts",
    }}
    cacheLocation="localstorage"
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
