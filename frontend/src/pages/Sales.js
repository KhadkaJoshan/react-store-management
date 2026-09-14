import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../App.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { useAuth0 } from "@auth0/auth0-react";
import { useApi, getBackendHealthUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import StatCard from "../components/StatCard";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function Sales() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const api = useApi();
  const toast = useToast();

  const fetchSales = useCallback(() => {
    if (!isAuthenticated) return;
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

  // Column Definitions
  const colDefs = [
    {
      field: "SalesID",
      headerName: "Receipt #",
      flex: 1,
      minWidth: 100,
      filter: true,
      sort: ["desc"],
      cellRenderer: (params) => (
        <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
          #{params.value}
        </span>
      ),
    },
    {
      field: "SName",
      headerName: "Product Sold",
      flex: 3,
      minWidth: 180,
      filter: true,
      cellRenderer: (params) => (
        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "SPrice",
      headerName: "Unit Price",
      flex: 2,
      minWidth: 110,
      filter: true,
      cellRenderer: (params) => (
        <span>NRs. {Number(params.value || 0).toFixed(2)}</span>
      ),
    },
    {
      field: "SQuantity",
      headerName: "Quantity Sold",
      flex: 2,
      minWidth: 130,
      filter: true,
      cellRenderer: (params) => (
        <span
          style={{
            background: "#eef2ff",
            color: "#4f46e5",
            padding: "0.2rem 0.6rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {params.value} units
        </span>
      ),
    },
    {
      field: "DOS",
      headerName: "Date of Sale",
      flex: 2,
      minWidth: 130,
      filter: true,
      cellRenderer: (params) => (
        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <i
            className="fa fa-calendar-alt"
            style={{ marginRight: "0.4rem", color: "var(--text-light)" }}
          ></i>
          {params.value}
        </span>
      ),
    },
    {
      field: "Stotal",
      headerName: "Total Amount",
      flex: 2,
      minWidth: 130,
      filter: true,
      cellRenderer: (params) => (
        <span
          style={{
            fontWeight: 700,
            color: "var(--success)",
            fontSize: "0.95rem",
          }}
        >
          NRs. {Number(params.value || 0).toFixed(2)}
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
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="fa fa-chart-line" style={{ color: "var(--primary)" }}></i>
            Sales Analytics &amp; Reports
          </h1>
          <p className="page-subtitle">
            Historical transaction log, revenue totals, and sales performance summary.
          </p>
        </div>

        <div>
          <button
            onClick={fetchSales}
            className="btn-modern btn-secondary-modern"
            disabled={isFetching}
          >
            <i className={`fa fa-sync-alt ${isFetching ? "fa-spin" : ""}`}></i>
            <span>{isFetching ? "Refreshing..." : "Refresh Report"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Gross Revenue"
          value={`NRs. ${stats.totalRevenue}`}
          subtitle="All completed transactions"
          icon="fa-money-bill-wave"
          color="emerald"
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions}
          subtitle="Receipts recorded"
          icon="fa-receipt"
          color="indigo"
        />
        <StatCard
          title="Total Units Sold"
          value={stats.totalUnitsSold}
          subtitle="Items purchased by customers"
          icon="fa-cart-shopping"
          color="amber"
        />
        <StatCard
          title="Avg Order Value"
          value={`NRs. ${stats.avgOrderValue}`}
          subtitle="Average revenue per sale"
          icon="fa-chart-pie"
          color="indigo"
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

      {/* Search Bar & Grid Controls */}
      <div className="action-bar">
        <div className="search-input-wrapper">
          <i className="fa fa-search"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by product, date, or receipt #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing <strong>{filteredSales.length}</strong> of{" "}
          <strong>{sales.length}</strong> sales transactions
        </div>
      </div>

      {/* Data Grid */}
      <div className="ag-theme-quartz" style={{ height: 480, width: "100%" }}>
        <AgGridReact
          rowSelection="single"
          rowData={filteredSales}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
        />
      </div>
    </div>
  );
}

export default Sales;
