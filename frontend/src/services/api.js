import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useMemo, useRef } from "react";

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
  const { token, user, isAuthenticated } = useAuth();
  const authRef = useRef({ token, user, isAuthenticated });
  authRef.current = { token, user, isAuthenticated };

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
    });

    instance.interceptors.request.use(
      (config) => {
        const auth = authRef.current;
        const currentToken = auth.token || localStorage.getItem("storeflow_google_token");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        if (auth.user?.email) {
          config.headers["x-user-email"] = auth.user.email;
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
  }, []);

  return api;
};
