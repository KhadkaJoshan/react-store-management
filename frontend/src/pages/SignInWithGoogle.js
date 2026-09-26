import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import LanguageToggle from "../components/LanguageToggle";

const SignInWithGoogle = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  // If already logged in, automatically proceed to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/viewproducts", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        login(credentialResponse.credential);
        navigate("/viewproducts", { replace: true });
      } else {
        setAuthError("No credentials received from Google.");
      }
    } catch (err) {
      setAuthError(err.message || "Failed to process Google sign in.");
    }
  };

  const handleGoogleError = () => {
    setAuthError("Google Sign-In failed or was closed. Please try again.");
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-body)",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-body)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Top Brand & Status Navigation Bar */}
      <header
        style={{
          width: "100%",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "1.1rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
            }}
          >
            <i className="fa fa-cubes"></i>
          </div>
          <div>
            <span
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.03em",
              }}
            >
              {t("brandName")}<span style={{ color: "var(--primary)" }}> {t("brandSubtitle")}</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Language Toggle Button */}
          <LanguageToggle />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.8rem",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                display: "inline-block",
              }}
            />
            {t("navSystemOnline")}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "880px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Brand Pill Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-light)",
              border: "1px solid #bbf7d0",
              color: "var(--primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}
          >
            <i className="fa fa-shield-halved" style={{ color: "var(--primary)" }}></i>
            {t("enterprisePill")}
          </div>

          {/* Hero Heading */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 800,
              color: "var(--text-main)",
              letterSpacing: "-0.03em",
              lineHeight: 1.18,
              marginBottom: "1rem",
            }}
          >
            {t("heroTitle1")}{" "}
            <span
              style={{
                color: "var(--primary)",
              }}
            >
              {t("heroTitle2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-muted)",
              maxWidth: "620px",
              margin: "0 auto 2.5rem auto",
              lineHeight: 1.6,
            }}
          >
            {t("heroDescription")}
          </p>

          {/* Sign-In Card */}
          <div
            style={{
              maxWidth: "440px",
              margin: "0 auto",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem 2.25rem",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
              textAlign: "center",
            }}
          >
            {/* Center Logo Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "1.5rem",
                margin: "0 auto 1.25rem auto",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              }}
            >
              <i className="fa fa-cubes"></i>
            </div>

            <h3
              style={{
                color: "var(--text-main)",
                fontSize: "1.35rem",
                fontWeight: 700,
                marginBottom: "0.35rem",
                letterSpacing: "-0.02em",
              }}
            >
              {t("welcomeLogin")}
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                marginBottom: "2rem",
                lineHeight: 1.4,
              }}
            >
              {t("loginSubtitle")}
            </p>

            {/* Error banner if authentication reports an error */}
            {authError && (
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  textAlign: "left",
                  lineHeight: 1.45,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 700,
                    marginBottom: "0.3rem",
                  }}
                >
                  <i className="fa fa-circle-exclamation"></i>
                  <span>Authentication Notice</span>
                </div>
                <div>{authError}</div>
              </div>
            )}

            {/* Google Native Sign In Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                minHeight: "44px",
                marginBottom: "1.25rem",
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
                text="signin_with"
              />
            </div>

            {/* Security Badge Footer */}
            <div
              style={{
                marginTop: "1.75rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--border)",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
              }}
            >
              <i className="fa fa-shield-check" style={{ color: "var(--success)" }}></i>
              <span>{t("googleVerified")}</span>
            </div>
          </div>

          {/* Feature Showcase Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
              marginTop: "3.5rem",
              textAlign: "left",
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "8px",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                }}
              >
                <i className="fa fa-boxes-stacked"></i>
              </div>
              <h4
                style={{
                  color: "var(--text-main)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "0.35rem",
                }}
              >
                {t("feature1Title")}
              </h4>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  lineHeight: 1.55,
                }}
              >
                {t("feature1Desc")}
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#ecfdf5",
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                }}
              >
                <i className="fa fa-receipt"></i>
              </div>
              <h4
                style={{
                  color: "var(--text-main)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "0.35rem",
                }}
              >
                {t("feature2Title")}
              </h4>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  lineHeight: 1.55,
                }}
              >
                {t("feature2Desc")}
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#fffbeb",
                  color: "var(--warning)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                }}
              >
                <i className="fa fa-chart-line"></i>
              </div>
              <h4
                style={{
                  color: "var(--text-main)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "0.35rem",
                }}
              >
                {t("feature3Title")}
              </h4>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  lineHeight: 1.55,
                }}
              >
                {t("feature3Desc")}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching Layout */}
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
          <strong style={{ color: "var(--text-main)" }}>{t("brandName")} {t("brandSubtitle")}</strong> &mdash;{" "}
          {t("footerText")}
        </div>
      </footer>
    </div>
  );
};

export default SignInWithGoogle;
