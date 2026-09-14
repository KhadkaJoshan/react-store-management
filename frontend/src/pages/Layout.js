import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          background: "#ffffff",
          padding: "1.25rem 1.5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          marginTop: "auto",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          &copy; {new Date().getFullYear()}{" "}
          <strong style={{ color: "var(--text-main)" }}>StoreFlow</strong> &mdash; Modern
          Inventory Management & POS Solution.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
