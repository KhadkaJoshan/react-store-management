import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const hostname = window.location.hostname || "127.0.0.1";

    // If on HTTPS, connect to backend HTTPS port 8443
    if (isHttps) {
      if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.startsWith("https:")) {
        return process.env.REACT_APP_API_URL;
      }
      return `https://${hostname}:8443`;
    }

    // If on HTTP, connect to backend HTTP port 8081
    if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.startsWith("http:")) {
      return process.env.REACT_APP_API_URL;
    }
    return `http://${hostname}:8081`;
  }
  return process.env.REACT_APP_API_URL || "https://127.0.0.1:8443";
};

export const getBackendHealthUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "127.0.0.1";
    return window.location.protocol === "https:"
      ? `https://${hostname}:8443/health`
      : `http://${hostname}:8081/health`;
  }
  return "https://127.0.0.1:8443/health";
};

export const useApi = () => {
  const { getIdTokenClaims, getAccessTokenSilently, user, isAuthenticated } = useAuth0();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiBaseUrl(),
    });

    instance.interceptors.request.use(
      async (config) => {
        if (isAuthenticated) {
          try {
            let token = null;

            // Prioritize ID token as it reliably contains user profile and email
            try {
              const claims = await getIdTokenClaims();
              token = claims?.__raw;
            } catch (claimErr) {
              console.warn("Could not retrieve ID token claims directly:", claimErr);
            }

            if (!token) {
              try {
                token = await getAccessTokenSilently();
              } catch (silentErr) {
                console.warn("Could not retrieve access token silently:", silentErr);
              }
            }

            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }

            if (user?.email) {
              config.headers["x-user-email"] = user.email;
            }
          } catch (error) {
            console.error("Failed to attach Auth0 authentication headers:", error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.message === "Network Error") {
          console.error(
            "[API Network Error] Could not reach backend server at",
            getApiBaseUrl(),
            "\nIf you are viewing over HTTPS, please authorize the backend SSL certificate by visiting:",
            getBackendHealthUrl()
          );
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [getIdTokenClaims, getAccessTokenSilently, user, isAuthenticated]);

  return api;
};
