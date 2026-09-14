import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "storeflow_google_token";
const USER_KEY = "storeflow_google_user";

// Safe client-side UTF-8 JWT decoder for Google ID tokens
export function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate stored token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
        setToken(savedToken);
        const userData = {
          email: decoded.email,
          name: decoded.name || decoded.email.split("@")[0],
          picture: decoded.picture,
          sub: decoded.sub,
        };
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        // Expired token
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((googleCredential) => {
    if (!googleCredential) return;
    const decoded = decodeJwt(googleCredential);
    if (!decoded) {
      console.error("Could not parse Google credential");
      return;
    }

    const userData = {
      email: decoded.email,
      name: decoded.name || decoded.email.split("@")[0],
      picture: decoded.picture,
      sub: decoded.sub,
    };

    localStorage.setItem(TOKEN_KEY, googleCredential);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(googleCredential);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    window.location.href = "/";
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    setError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Backwards compatibility shim for existing components using useAuth0
export const useAuth0 = useAuth;
