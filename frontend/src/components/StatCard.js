import React from "react";

const StatCard = ({ title, value, subtitle, icon, color = "indigo" }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        <i className={`fa ${icon}`}></i>
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "0.2rem",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
