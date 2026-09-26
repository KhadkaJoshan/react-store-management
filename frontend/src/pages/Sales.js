import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";
import { useApi, getBackendHealthUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import StatCard from "../components/StatCard";
import ResponsiveDataTable from "../components/ResponsiveDataTable";
import SalesAnalyticsCharts from "../components/SalesAnalyticsCharts";

function Sales() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("combined"); // "combined" | "analytics" | "table"
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const api = useApi();
  const toast = useToast();
  const inFlightRef = useRef(false);

  const fetchSales = useCallback(() => {
    if (!isAuthenticated) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsFetching(true);
    setFetchError("");

    api
      .get("/sales")
      .then((res) => {
        setSales(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        const errorMsg =
          err.response?.data?.error || err.message || "Failed to fetch sales";
        setFetchError(errorMsg);
        toast.error(errorMsg);
      })
      .finally(() => {
        inFlightRef.current = false;
        setIsFetching(false);
      });
  }, [api, isAuthenticated, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    }
  }, [isAuthenticated, fetchSales]);

  // Calculate Sales Performance Metrics
  const stats = useMemo(() => {
    const totalTransactions = sales.length;
    const totalRevenue = sales.reduce(
      (acc, s) => acc + (Number(s.Stotal) || 0),
      0
    );
    const totalUnitsSold = sales.reduce(
      (acc, s) => acc + (Number(s.SQuantity) || 0),
      0
    );
    const avgOrderValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalTransactions,
      totalRevenue: totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalUnitsSold,
      avgOrderValue: avgOrderValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  }, [sales]);

  // Filter Sales Records
  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(
      (s) =>
        String(s.SName || "").toLowerCase().includes(term) ||
        String(s.SalesID || "").includes(term) ||
        String(s.DOS || "").toLowerCase().includes(term)
    );
  }, [sales, searchTerm]);

  // Table Column Definitions
  const columns = [
    {
      key: "SalesID",
      label: t("receiptCol"),
      width: "110px",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
          #{val}
        </span>
      ),
    },
    {
      key: "SName",
      label: t("productSold"),
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
          {val}
        </span>
      ),
    },
    {
      key: "SPrice",
      label: t("unitPrice"),
      width: "140px",
      sortable: true,
      render: (val) => (
        <span>NRs. {Number(val || 0).toFixed(2)}</span>
      ),
    },
    {
      key: "SQuantity",
      label: t("quantitySold"),
      width: "150px",
      sortable: true,
      render: (val) => (
        <span
          style={{
            background: "var(--primary-light)",
            color: "var(--primary)",
            padding: "0.2rem 0.6rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {val} {t("units")}
        </span>
      ),
    },
    {
      key: "DOS",
      label: t("dateOfSale"),
      width: "160px",
      sortable: true,
      render: (val) => (
        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <i
            className="fa fa-calendar-alt"
            style={{ marginRight: "0.4rem", color: "var(--text-light)" }}
          ></i>
          {val}
        </span>
      ),
    },
    {
      key: "Stotal",
      label: t("totalAmount"),
      width: "160px",
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: "var(--success)",
            fontSize: "0.95rem",
          }}
        >
          NRs. {Number(val || 0).toFixed(2)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <i
          className="fa fa-circle-notch fa-spin"
          style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1rem" }}
        ></i>
        <h4 style={{ color: "var(--text-muted)" }}>Loading sales report...</h4>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h3>Please log in to view sales analytics.</h3>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i
              className="fa fa-chart-line"
              style={{ color: "var(--primary)" }}></i>
            {t("salesTitle")}
          </h1>
          <p className="page-subtitle">
            {t("salesSubtitle")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={fetchSales}
            className="btn-modern btn-secondary-modern"
            disabled={isFetching}
            title={t("refresh")}
          >
            <i className={`fa fa-sync-alt ${isFetching ? "fa-spin" : ""}`}></i>
            <span>{isFetching ? t("refreshing") : t("refresh")}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <StatCard
          title={t("totalTransactions")}
          value={stats.totalTransactions}
          subtitle={t("completedCustomerOrders")}
          icon="fa-receipt"
          color="forest"
        />
        <StatCard
          title={t("totalRevenue")}
          value={`NRs. ${stats.totalRevenue}`}
          subtitle={t("cumulativeEarnings")}
          icon="fa-sack-dollar"
          color="emerald"
        />
        <StatCard
          title={t("totalUnitsSold")}
          value={stats.totalUnitsSold}
          subtitle={t("itemsPurchased")}
          icon="fa-cart-shopping"
          color="amber"
        />
        <StatCard
          title={t("avgOrderValue")}
          value={`NRs. ${stats.avgOrderValue}`}
          subtitle={t("averagePerSale")}
          icon="fa-chart-pie"
          color="slate"
        />
      </div>

      {/* Error Alert */}
      {fetchError && (
        <div
          style={{
            background: "#fff1f2",
            color: "#9f1239",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #fecdd3",
            marginBottom: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <i
                className="fa fa-triangle-exclamation"
                style={{ fontSize: "1.25rem", marginTop: "0.15rem", color: "#e11d48" }}
              ></i>
              <div>
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                  Backend Communication Error: {fetchError}
                </div>
                {fetchError.toLowerCase().includes("network") &&
                  typeof window !== "undefined" &&
                  window.location.protocol === "https:" && (
                    <div style={{ fontSize: "0.88rem", color: "#881337", marginTop: "0.35rem" }}>
                      Since you are running over <strong>HTTPS</strong>, your browser may need you to
                      authorize the backend security certificate on port 8443.
                      <div style={{ marginTop: "0.5rem" }}>
                        <a
                          href={getBackendHealthUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-modern"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            background: "#e11d48",
                            color: "#ffffff",
                            padding: "0.4rem 0.85rem",
                            fontSize: "0.85rem",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          <i className="fa fa-shield-halved"></i>
                          1-Click Authorize Backend Certificate ({getBackendHealthUrl()})
                        </a>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <button
              onClick={fetchSales}
              className="btn-modern btn-secondary-modern"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
            >
              <i className="fa fa-rotate-right"></i> Retry Report
            </button>
          </div>
        </div>
      )}

      {/* Visual Sales Analytics Charts & Metrics */}
      <SalesAnalyticsCharts
        sales={filteredSales}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Search Bar & Stats */}
      <div className="action-bar">
        <div className="search-input-wrapper">
          <i className="fa fa-search"></i>
          <input
            type="text"
            className="search-input"
            placeholder={t("searchSalesPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0 0.5rem",
              }}
              title={t("clear")}
            >
              <i className="fa fa-times-circle"></i>
            </button>
          )}
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {t("showingSales", { count: filteredSales.length, total: sales.length })}
        </div>
      </div>

      {/* Responsive Custom SaaS Data Table */}
      {viewMode !== "analytics" ? (
        <ResponsiveDataTable
          columns={columns}
          data={filteredSales}
          keyField="SalesID"
          exportFileName="Gajurmukhi-Veterinary-Sales"
          emptyTitle={t("noSalesRecorded")}
          emptyMessage={
            searchTerm
              ? t("noProductsMatch", { term: searchTerm })
              : t("noSalesYetMessage")
          }
          renderMobileHeader={(s) => ({
            title: s.SName,
            subtitle: `${t("receiptCol")} #${s.SalesID} • ${s.DOS}`,
            badge: (
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--success)",
                  fontSize: "1rem",
                }}
              >
                NRs. {Number(s.Stotal || 0).toFixed(2)}
              </span>
            ),
          })}
        />
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            background: "#ffffff",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
          }}
        >
          Currently in <strong>Visual Charts</strong> mode. Toggle to <strong>Combined View</strong> or <strong>Data Table</strong> in the controls above to inspect individual transaction line items.
        </div>
      )}
    </div>
  );
}

export default Sales;
