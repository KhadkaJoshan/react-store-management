import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const Layout = () => {
  const { t } = useLanguage();

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
          <strong style={{ color: "var(--text-main)" }}>
            {t("brandName")} {t("brandSubtitle")}
          </strong>{" "}
          &mdash; {t("footerText")}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
