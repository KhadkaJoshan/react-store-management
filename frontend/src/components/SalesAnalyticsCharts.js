import React, { useState, useMemo } from "react";
import "./SalesAnalyticsCharts.css";
import { useLanguage } from "../context/LanguageContext";

// SVG Chart Dimensions & Layout Constants
const CHART_HEIGHT = 220;
const CHART_WIDTH = 650;
const PADDING = { top: 25, right: 30, bottom: 35, left: 65 };
const USABLE_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const USABLE_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const SalesAnalyticsCharts = ({ sales = [], viewMode, onViewModeChange }) => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState("all"); // "7d" | "30d" | "all"
  const [activeMetric, setActiveMetric] = useState("revenue"); // "revenue" | "units" | "orders"
  const [topProductMetric, setTopProductMetric] = useState("revenue"); // "revenue" | "units"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Group and sort sales by date
  const dailyData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const map = {};

    sales.forEach((s) => {
      // Normalize date string (e.g. "2026-9-26" or ISO string)
      let dateKey = s.DOS || "Unknown";
      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          revenue: 0,
          units: 0,
          orders: 0,
          timestamp: new Date(dateKey).getTime() || 0,
        };
      }
      map[dateKey].revenue += Number(s.Stotal) || 0;
      map[dateKey].units += Number(s.SQuantity) || 0;
      map[dateKey].orders += 1;
    });

    let list = Object.values(map).sort((a, b) => a.timestamp - b.timestamp);

    // Apply timeframe filter
    if (timeframe === "7d") {
      list = list.slice(-7);
    } else if (timeframe === "30d") {
      list = list.slice(-30);
    }

    return list;
  }, [sales, timeframe]);

  // Executive KPI summary calculations
  const highlights = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        peakDay: { date: "N/A", revenue: 0 },
        topProduct: { name: "N/A", revenue: 0, units: 0 },
        avgUnitsPerSale: 0,
        uniqueProductsCount: 0,
      };
    }

    // Peak revenue day
    let peakDay = { date: "N/A", revenue: 0 };
    dailyData.forEach((d) => {
      if (d.revenue > peakDay.revenue) {
        peakDay = { date: d.date, revenue: d.revenue };
      }
    });

    // Top product
    const productMap = {};
    sales.forEach((s) => {
      const name = s.SName || "Unnamed";
      if (!productMap[name]) {
        productMap[name] = { name, revenue: 0, units: 0 };
      }
      productMap[name].revenue += Number(s.Stotal) || 0;
      productMap[name].units += Number(s.SQuantity) || 0;
    });

    const products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
    const topProduct = products[0] || { name: "N/A", revenue: 0, units: 0 };

    const totalUnits = sales.reduce((acc, s) => acc + (Number(s.SQuantity) || 0), 0);
    const avgUnitsPerSale = sales.length > 0 ? (totalUnits / sales.length).toFixed(1) : 0;

    return {
      peakDay,
      topProduct,
      avgUnitsPerSale,
      uniqueProductsCount: products.length,
    };
  }, [sales, dailyData]);

  // Top 5 products ranking
  const topProducts = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const productMap = {};
    let grandRevenue = 0;

    sales.forEach((s) => {
      const name = s.SName || "Unnamed";
      const total = Number(s.Stotal) || 0;
      const qty = Number(s.SQuantity) || 0;

      if (!productMap[name]) {
        productMap[name] = { name, revenue: 0, units: 0 };
      }
      productMap[name].revenue += total;
      productMap[name].units += qty;
      grandRevenue += total;
    });

    const sorted = Object.values(productMap).sort((a, b) => {
      if (topProductMetric === "revenue") return b.revenue - a.revenue;
      return b.units - a.units;
    });

    const topList = sorted.slice(0, 5);
    const maxVal =
      topProductMetric === "revenue"
        ? topList[0]?.revenue || 1
        : topList[0]?.units || 1;

    return topList.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      percentOfTop: Math.min(
        100,
        Math.round(((topProductMetric === "revenue" ? p.revenue : p.units) / maxVal) * 100)
      ),
      shareOfTotal:
        grandRevenue > 0
          ? Math.round((p.revenue / grandRevenue) * 100)
          : 0,
    }));
  }, [sales, topProductMetric]);

  // Order value tier distribution
  const orderTiers = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const tiers = [
      { id: "tier-1", label: "< NRs. 500", count: 0, color: "#15803d" },
      { id: "tier-2", label: "NRs. 500 - 2k", count: 0, color: "#0f766e" },
      { id: "tier-3", label: "NRs. 2k - 5k", count: 0, color: "#b45309" },
      { id: "tier-4", label: "> NRs. 5k", count: 0, color: "#0f172a" },
    ];

    sales.forEach((s) => {
      const val = Number(s.Stotal) || 0;
      if (val < 500) tiers[0].count += 1;
      else if (val <= 2000) tiers[1].count += 1;
      else if (val <= 5000) tiers[2].count += 1;
      else tiers[3].count += 1;
    });

    const total = sales.length || 1;
    return tiers.map((t) => ({
      ...t,
      percentage: Math.round((t.count / total) * 100),
    }));
  }, [sales]);

  const maxChartValue = useMemo(() => {
    if (dailyData.length === 0) return 100;
    const values = dailyData.map((d) => d[activeMetric] || 0);
    const max = Math.max(...values, 0);
    return max === 0 ? 100 : Math.ceil(max * 1.15);
  }, [dailyData, activeMetric]);

  // Coordinates for timeline points
  const points = useMemo(() => {
    if (dailyData.length === 0) return [];
    if (dailyData.length === 1) {
      const val = dailyData[0][activeMetric] || 0;
      const x = PADDING.left + USABLE_WIDTH / 2;
      const y = PADDING.top + USABLE_HEIGHT - (val / maxChartValue) * USABLE_HEIGHT;
      return [{ ...dailyData[0], x, y }];
    }

    return dailyData.map((d, index) => {
      const x = PADDING.left + (index / (dailyData.length - 1)) * USABLE_WIDTH;
      const val = d[activeMetric] || 0;
      const y = PADDING.top + USABLE_HEIGHT - (val / maxChartValue) * USABLE_HEIGHT;
      return { ...d, x, y };
    });
  }, [dailyData, activeMetric, maxChartValue]);

  // Construct SVG Path
  const linePath = useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, "");
  }, [points]);

  // Bar chart coordinates for when bars are preferred or small datasets
  const barWidth = useMemo(() => {
    if (dailyData.length === 0) return 20;
    const computed = (USABLE_WIDTH / dailyData.length) * 0.48;
    return Math.max(12, Math.min(36, computed));
  }, [dailyData.length]);

  return (
    <div className="analytics-container">
      {/* Analytics Toolbar */}
      <div className="analytics-toolbar">
        {/* View Mode Toggle */}
        <div className="view-mode-tabs">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "combined" ? "active" : ""}`}
            onClick={() => onViewModeChange("combined")}
            title="Show both visual charts and data table"
          >
            <i className="fa fa-layer-group"></i>
            <span>{t("combinedView")}</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "analytics" ? "active" : ""}`}
            onClick={() => onViewModeChange("analytics")}
            title="Focus on sales charts and visual metrics"
          >
            <i className="fa fa-chart-line"></i>
            <span>{t("visualCharts")}</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => onViewModeChange("table")}
            title="Show raw tabular transactions"
          >
            <i className="fa fa-table-list"></i>
            <span>{t("dataTable")}</span>
          </button>
        </div>

        {/* Timeframe Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {t("period")}
          </span>
          <div className="timeframe-selector">
            <button
              type="button"
              className={`timeframe-btn ${timeframe === "7d" ? "active" : ""}`}
              onClick={() => setTimeframe("7d")}
            >
              {t("last7Days")}
            </button>
            <button
              type="button"
              className={`timeframe-btn ${timeframe === "30d" ? "active" : ""}`}
              onClick={() => setTimeframe("30d")}
            >
              {t("last30Days")}
            </button>
            <button
              type="button"
              className={`timeframe-btn ${timeframe === "all" ? "active" : ""}`}
              onClick={() => setTimeframe("all")}
            >
              {t("allTime")}
            </button>
          </div>
        </div>
      </div>

      {viewMode !== "table" && (
        <>
          {/* Executive Highlights Grid */}
          <div className="highlights-grid">
        <div className="highlight-box">
          <div className="highlight-icon green">
            <i className="fa fa-calendar-check"></i>
          </div>
          <div className="highlight-content">
            <div className="highlight-label">{t("peakSalesDate")}</div>
            <div className="highlight-value" title={highlights.peakDay.date}>
              {highlights.peakDay.date}
            </div>
            <div className="highlight-sub">
              NRs. {highlights.peakDay.revenue.toLocaleString()} {t("peakVolume", { amount: "" }).trim()}
            </div>
          </div>
        </div>

        <div className="highlight-box">
          <div className="highlight-icon amber">
            <i className="fa fa-trophy"></i>
          </div>
          <div className="highlight-content">
            <div className="highlight-label">{t("topSellingItem")}</div>
            <div className="highlight-value" title={highlights.topProduct.name}>
              {highlights.topProduct.name}
            </div>
            <div className="highlight-sub">
              NRs. {highlights.topProduct.revenue.toLocaleString()} &bull; {highlights.topProduct.units} {t("units")}
            </div>
          </div>
        </div>

        <div className="highlight-box">
          <div className="highlight-icon slate">
            <i className="fa fa-basket-shopping"></i>
          </div>
          <div className="highlight-content">
            <div className="highlight-label">{t("avgUnitsCheckout")}</div>
            <div className="highlight-value">{highlights.avgUnitsPerSale} {t("units")}</div>
            <div className="highlight-sub">{t("avgCartItems")}</div>
          </div>
        </div>

        <div className="highlight-box">
          <div className="highlight-icon rose">
            <i className="fa fa-tags"></i>
          </div>
          <div className="highlight-content">
            <div className="highlight-label">{t("catalogPenetration")}</div>
            <div className="highlight-value">{highlights.uniqueProductsCount} {t("units")}</div>
            <div className="highlight-sub">{t("distinctItemsOrdered")}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Main Timeline Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-area">
              <h3>
                <i className="fa fa-chart-area" style={{ color: "var(--primary)" }}></i>
                {t("salesTimelineTrend")}
              </h3>
              <div className="chart-subtitle">
                {t("salesTimelineSub")}
              </div>
            </div>

            {/* Metric Pills */}
            <div className="chart-metric-pills">
              <button
                type="button"
                className={`chart-pill-btn ${activeMetric === "revenue" ? "active" : ""}`}
                onClick={() => setActiveMetric("revenue")}
              >
                {t("metricRevenue")}
              </button>
              <button
                type="button"
                className={`chart-pill-btn ${activeMetric === "units" ? "active" : ""}`}
                onClick={() => setActiveMetric("units")}
              >
                {t("metricUnits")}
              </button>
              <button
                type="button"
                className={`chart-pill-btn ${activeMetric === "orders" ? "active" : ""}`}
                onClick={() => setActiveMetric("orders")}
              >
                {t("metricOrders")}
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="svg-chart-wrapper">
            {dailyData.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "var(--text-muted)",
                }}
              >
                <i className="fa fa-chart-line" style={{ fontSize: "2rem", color: "#cbd5e1" }}></i>
                <span style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  No transaction data available for this timeframe
                </span>
              </div>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                  className="svg-chart-element"
                  preserveAspectRatio="none"
                >
                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = PADDING.top + USABLE_HEIGHT * (1 - pct);
                    const val = Math.round(maxChartValue * pct);
                    let formattedVal = val.toLocaleString();
                    if (activeMetric === "revenue") {
                      formattedVal = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
                    }

                    return (
                      <g key={idx}>
                        <line
                          x1={PADDING.left}
                          y1={y}
                          x2={CHART_WIDTH - PADDING.right}
                          y2={y}
                          className="chart-grid-line"
                        />
                        <text
                          x={PADDING.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="chart-axis-label"
                        >
                          {formattedVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Clean Bars for each day */}
                  {points.map((pt, idx) => {
                    const barHeight = Math.max(2, USABLE_HEIGHT - (pt.y - PADDING.top));
                    return (
                      <rect
                        key={`bar-${idx}`}
                        x={pt.x - barWidth / 2}
                        y={pt.y}
                        width={barWidth}
                        height={barHeight}
                        className="chart-bar-rect"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}

                  {/* Clean Solid Line Overlay */}
                  {linePath && <path d={linePath} className="chart-data-line" />}

                  {/* Points on Line */}
                  {points.map((pt, idx) => (
                    <circle
                      key={`pt-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="chart-data-point"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                  {/* X-Axis Date Labels */}
                  {points.map((pt, idx) => {
                    // Show evenly spaced labels to prevent overlap
                    const step = Math.ceil(points.length / 6);
                    if (idx % step !== 0 && idx !== points.length - 1) return null;

                    // Clean date format (e.g., "Sep 26")
                    const dateObj = new Date(pt.date);
                    const label = !isNaN(dateObj)
                      ? dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : pt.date;

                    return (
                      <text
                        key={`lbl-${idx}`}
                        x={pt.x}
                        y={CHART_HEIGHT - 10}
                        textAnchor="middle"
                        className="chart-axis-label"
                      >
                        {label}
                      </text>
                    );
                  })}
                </svg>

                {/* Floating Tooltip */}
                {hoveredPoint && (
                  <div
                    className="chart-tooltip-box"
                    style={{
                      left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`,
                      top: `${(hoveredPoint.y / CHART_HEIGHT) * 100}%`,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>
                      {hoveredPoint.date}
                    </div>
                    <div>Revenue: NRs. {hoveredPoint.revenue.toLocaleString()}</div>
                    <div>Units Sold: {hoveredPoint.units} units</div>
                    <div>Orders: {hoveredPoint.orders} completed</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Top Performing Products Ranking */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-area">
              <h3>
                <i className="fa fa-ranking-star" style={{ color: "var(--accent)" }}></i>
                {t("topProductsRank")}
              </h3>
              <div className="chart-subtitle">{t("rankedBySales")}</div>
            </div>

            <div className="chart-metric-pills">
              <button
                type="button"
                className={`chart-pill-btn ${topProductMetric === "revenue" ? "active" : ""}`}
                onClick={() => setTopProductMetric("revenue")}
              >
                {t("metricRevenue")}
              </button>
              <button
                type="button"
                className={`chart-pill-btn ${topProductMetric === "units" ? "active" : ""}`}
                onClick={() => setTopProductMetric("units")}
              >
                {t("metricUnits")}
              </button>
            </div>
          </div>

          <div className="product-rankings-list">
            {topProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                {t("noProductsFound")}
              </div>
            ) : (
              topProducts.map((p) => (
                <div key={p.name} className="product-rank-item">
                  <div className="product-rank-header">
                    <div className="product-rank-name" title={p.name}>
                      <span className={`rank-badge top-${p.rank}`}>#{p.rank}</span>
                      <span>{p.name}</span>
                    </div>
                    <div className="product-rank-stats">
                      {topProductMetric === "revenue"
                        ? `NRs. ${p.revenue.toLocaleString()}`
                        : `${p.units} ${t("units")}`}
                      <span className="product-rank-sub">({p.shareOfTotal}%)</span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${p.percentOfTop}%`,
                        background:
                          p.rank === 1
                            ? "var(--primary)"
                            : p.rank === 2
                            ? "#0f766e"
                            : "var(--text-muted)",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction Size Distribution Bar */}
      <div className="distribution-row">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: 0,
              }}
            >
              <i className="fa fa-chart-pie" style={{ color: "var(--primary)" }}></i>
              {t("transactionBasket")}
            </h4>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              {t("basketSub")}
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
            {t("totalReceipts", { count: sales.length })}
          </div>
        </div>

        {/* Segmented Solid Progress Bar */}
        <div className="distribution-bar">
          {orderTiers.map((t) => (
            <div
              key={t.id}
              className={`dist-segment ${t.id}`}
              style={{ width: `${t.percentage}%`, background: t.color }}
              title={`${t.label}: ${t.count} orders (${t.percentage}%)`}
            />
          ))}
        </div>

        {/* Legend Cards */}
        <div className="dist-legend-grid">
          {orderTiers.map((t) => (
            <div key={t.id} className="dist-legend-card">
              <div className="dist-dot" style={{ background: t.color }} />
              <div className="dist-legend-info">
                <span className="dist-legend-label">{t.label}</span>
                <span className="dist-legend-val">
                  {t.count} orders ({t.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalyticsCharts;
