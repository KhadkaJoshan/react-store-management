import React from "react";
import { useLanguage } from "../context/LanguageContext";
import "./LanguageToggle.css";

const LanguageToggle = ({ variant = "pill" }) => {
  const { language, setLanguage, toggleLanguage, isNepali } = useLanguage();

  if (variant === "segmented") {
    return (
      <div className="lang-segmented-control" role="group" aria-label="Language Selector">
        <button
          type="button"
          className={`lang-seg-btn ${language === "en" ? "active" : ""}`}
          onClick={() => setLanguage("en")}
          title="Switch to English"
        >
          <span>🇬🇧</span>
          <span>English</span>
        </button>
        <button
          type="button"
          className={`lang-seg-btn ${language === "ne" ? "active" : ""}`}
          onClick={() => setLanguage("ne")}
          title="नेपालीमा हेर्नुहोस्"
        >
          <span>🇳🇵</span>
          <span>नेपाली</span>
        </button>
      </div>
    );
  }

  // Default compact pill button
  return (
    <button
      type="button"
      className="lang-toggle-btn"
      onClick={toggleLanguage}
      title={isNepali ? "Switch to English" : "नेपालीमा स्विच गर्नुहोस्"}
      aria-label="Toggle language between English and Nepali"
    >
      <span className="lang-flag">{isNepali ? "🇳🇵" : "🇬🇧"}</span>
      <span className="lang-code">{isNepali ? "नेपाली" : "English"}</span>
      <span className="lang-divider">|</span>
      <span className="lang-alt">{isNepali ? "EN" : "नेपाली"}</span>
    </button>
  );
};

export default LanguageToggle;
