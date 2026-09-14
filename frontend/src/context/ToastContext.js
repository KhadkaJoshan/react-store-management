import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (msg, dur) => addToast(msg, "success", dur),
      error: (msg, dur) => addToast(msg, "error", dur),
      info: (msg, dur) => addToast(msg, "info", dur),
      warning: (msg, dur) => addToast(msg, "warning", dur),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          let bg = "#1e293b";
          let border = "#334155";
          let icon = "fa-info-circle";
          let iconColor = "#38bdf8";

          if (t.type === "success") {
            bg = "#064e3b";
            border = "#059669";
            icon = "fa-check-circle";
            iconColor = "#34d399";
          } else if (t.type === "error") {
            bg = "#7f1d1d";
            border = "#dc2626";
            icon = "fa-exclamation-circle";
            iconColor = "#f87171";
          } else if (t.type === "warning") {
            bg = "#78350f";
            border = "#d97706";
            icon = "fa-exclamation-triangle";
            iconColor = "#fbbf24";
          }

          return (
            <div
              key={t.id}
              style={{
                background: bg,
                color: "#ffffff",
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "0.85rem 1.25rem",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                minWidth: "280px",
                maxWidth: "400px",
                fontSize: "0.9rem",
                fontWeight: "500",
                pointerEvents: "auto",
                animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <i
                className={`fa ${icon}`}
                style={{ color: iconColor, fontSize: "1.1rem" }}
              ></i>
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "0 0.25rem",
                  fontSize: "0.9rem",
                }}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
