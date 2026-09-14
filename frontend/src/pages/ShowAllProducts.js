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
import AddProductModal from "../components/AddProductModal";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function ShowAllProducts() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowID, setSelectedRowID] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const api = useApi();
  const toast = useToast();

  const fetchProducts = useCallback(() => {
    if (!isAuthenticated) return;
    setIsFetching(true);
    setFetchError("");
    api
      .get("/products")
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message || "Failed to load products";
        setFetchError(msg);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [api, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, fetchProducts]);

  // Inventory Statistics Calculations
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (Number(p.Quantity) || 0), 0);
    const totalValuation = products.reduce((acc, p) => {
      const price = Number(p.Price) || 0;
      const qty = Math.max(0, Number(p.Quantity) || 0);
      return acc + price * qty;
    }, 0);
    const lowStockCount = products.filter((p) => Number(p.Quantity) <= 5).length;

    return {
      totalItems,
      totalUnits,
      totalValuation: totalValuation.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      lowStockCount,
    };
  }, [products]);

  // Filtered Products via Search Bar
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        String(p.Name || "").toLowerCase().includes(term) ||
        String(p.ID || "").includes(term)
    );
  }, [products, searchTerm]);

  // Column Definitions
  const colDefs = [
    {
      field: "ID",
      headerName: "SKU / ID",
      flex: 1,
      minWidth: 90,
      filter: true,
      sort: ["desc"],
      cellRenderer: (params) => (
        <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
          #{params.value}
        </span>
      ),
    },
    {
      field: "Name",
      headerName: "Product Name",
      flex: 3,
      minWidth: 180,
      filter: true,
      editable: true,
      cellRenderer: (params) => (
        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "Price",
      headerName: "Unit Price",
      flex: 2,
      minWidth: 120,
      filter: true,
      editable: true,
      cellRenderer: (params) => (
        <span style={{ fontWeight: 600, color: "var(--primary)" }}>
          NRs. {Number(params.value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      field: "Quantity",
      headerName: "Stock Status",
      flex: 2,
      minWidth: 140,
      filter: true,
      editable: true,
      cellRenderer: (params) => {
        const qty = Number(params.value) || 0;
        let badgeClass = "badge-in-stock";
        let label = `${qty} in stock`;

        if (qty <= 0) {
          badgeClass = "badge-out-stock";
          label = `Out of stock (${qty})`;
        } else if (qty <= 5) {
          badgeClass = "badge-low-stock";
          label = `Low stock (${qty})`;
        }

        return <span className={`badge-status ${badgeClass}`}>{label}</span>;
      },
    },
  ];

  // Update product inline cell value
  const onCellValueChanged = (e) => {
    const ID = e.data.ID;
    const values = e.data;

    api
      .put("/update/" + ID, values)
      .then(() => {
        toast.success(`Updated "${e.data.Name}" successfully!`);
      })
      .catch((err) => {
        const errorMsg =
          err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          "Failed to update product";
        toast.error(errorMsg);
        fetchProducts(); // Revert to server state
      });
  };

  // Delete product
  const deleteProduct = () => {
    if (!selectedRowID) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    api
      .delete("/delete/" + selectedRowID)
      .then(() => {
        toast.success("Product deleted successfully!");
        setSelectedRowID("");
        fetchProducts();
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Failed to delete product.");
      });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <i
          className="fa fa-circle-notch fa-spin"
          style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1rem" }}
        ></i>
        <h4 style={{ color: "var(--text-muted)" }}>Loading your inventory...</h4>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 1.5rem",
          maxWidth: "560px",
          margin: "0 auto",
        }}
      >
        {error ? (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: "var(--radius-lg)",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              textAlign: "left",
              marginBottom: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 700,
                marginBottom: "0.4rem",
              }}
            >
              <i className="fa fa-circle-exclamation"></i>
              <span>Authentication Notice</span>
            </div>
            <p style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>{error.message}</p>
            {error.error_description && (
              <p style={{ fontSize: "0.85rem", color: "#b91c1c", margin: 0 }}>
                {error.error_description}
              </p>
            )}
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem 2rem",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "12px",
                background: "#eef2ff",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1.25rem auto",
              }}
            >
              <i className="fa fa-lock"></i>
            </div>
            <h3
              style={{
                marginBottom: "0.5rem",
                color: "var(--text-main)",
                fontSize: "1.3rem",
              }}
            >
              Session Not Authenticated
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                marginBottom: "1.75rem",
              }}
            >
              Please sign in with your verified account to access your inventory and POS terminal.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-modern btn-primary-modern"
              style={{ width: "100%", padding: "0.75rem 1.25rem" }}
            >
              <i className="fa fa-arrow-left"></i> Return to Sign In
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="fa fa-boxes-stacked" style={{ color: "var(--primary)" }}></i>
            Product Catalog
          </h1>
          <p className="page-subtitle">
            Manage your store items, monitor stock levels, and update prices in real time.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-modern btn-primary-modern"
          >
            <i className="fa fa-plus"></i> Add Product
          </button>
          <button
            onClick={fetchProducts}
            className="btn-modern btn-secondary-modern"
            disabled={isFetching}
            title="Refresh Inventory"
          >
            <i className={`fa fa-sync-alt ${isFetching ? "fa-spin" : ""}`}></i>
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={deleteProduct}
            className="btn-modern btn-danger-modern"
            disabled={!selectedRowID}
            title="Delete Selected Item"
          >
            <i className="fa fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Products"
          value={stats.totalItems}
          subtitle="Active SKUs in catalog"
          icon="fa-box"
          color="indigo"
        />
        <StatCard
          title="Total Stock Units"
          value={stats.totalUnits}
          subtitle="Total available items"
          icon="fa-cubes"
          color="emerald"
        />
        <StatCard
          title="Inventory Valuation"
          value={`NRs. ${stats.totalValuation}`}
          subtitle="Gross catalog value"
          icon="fa-money-bill-wave"
          color="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          subtitle="Items with &le; 5 units"
          icon="fa-triangle-exclamation"
          color={stats.lowStockCount > 0 ? "amber" : "indigo"}
        />
      </div>

      {/* Error Alert if any */}
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
                      Since you are running over <strong>HTTPS</strong>, your browser (especially Safari)
                      requires a one-time security permission for the local backend server on port 8443.
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
                        <span style={{ fontSize: "0.8rem", marginLeft: "0.75rem", color: "#9f1239" }}>
                          (In Safari, click &quot;Show Details&quot; &rarr; &quot;visit this website&quot;, then return here)
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <button
              onClick={fetchProducts}
              className="btn-modern btn-secondary-modern"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
            >
              <i className="fa fa-rotate-right"></i> Retry Connection
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
            placeholder="Search by product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing <strong>{filteredProducts.length}</strong> of{" "}
          <strong>{products.length}</strong> items
        </div>
      </div>

      {/* Data Grid */}
      <div className="ag-theme-quartz" style={{ height: 480, width: "100%" }}>
        <AgGridReact
          rowSelection="single"
          rowData={filteredProducts}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          onCellValueChanged={onCellValueChanged}
          onRowSelected={(event) => {
            if (event.node.isSelected()) {
              setSelectedRowID(event.data.ID);
            }
          }}
        />
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={fetchProducts}
      />
    </div>
  );
}

export default ShowAllProducts;
