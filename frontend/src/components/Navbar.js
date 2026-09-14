import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/viewproducts", label: "Products", icon: "fa-boxes-stacked" },
    { to: "/newbilling", label: "New Bill", icon: "fa-receipt" },
    { to: "/sales", label: "Sales Report", icon: "fa-chart-line" },
  ];

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/viewproducts"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "1.1rem",
              boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
            }}
          >
            <i className="fa fa-cubes"></i>
          </div>
          <div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Store<span style={{ color: "var(--primary)" }}>Flow</span>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              Inventory & POS
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", gap: "0.4rem" }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive ? "var(--primary)" : "transparent",
                  textDecoration: "none",
                  transition: "var(--transition)",
                  boxShadow: isActive ? "0 4px 12px rgba(79, 70, 229, 0.35)" : "none",
                }}
              >
                <i className={`fa ${link.icon}`}></i>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Date Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--bg-body)",
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              border: "1px solid var(--border)",
            }}
          >
            <i className="fa fa-calendar" style={{ color: "var(--primary)" }}></i>
            <span>{currentDate}</span>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.35rem 0.75rem",
                background: "#f1f5f9",
                borderRadius: "var(--radius-full)",
                border: "1px solid #e2e8f0",
              }}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div
                style={{
                  maxWidth: "140px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                }}
              >
                {user.email || user.name}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="btn-modern btn-danger-modern"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            title="Log Out"
          >
            <i className="fa fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
