import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";
import { useApi, getBackendHealthUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import StatCard from "../components/StatCard";
import AddProductModal from "../components/AddProductModal";
import ResponsiveDataTable from "../components/ResponsiveDataTable";

function ShowAllProducts() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowID, setSelectedRowID] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const api = useApi();
  const toast = useToast();
  const inFlightRef = useRef(false);

  const fetchProducts = useCallback(() => {
    if (!isAuthenticated) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
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
        inFlightRef.current = false;
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

  // Table Column Definitions
  const columns = [
    {
      key: "ID",
      label: "SKU / ID",
      width: "110px",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
          #{val}
        </span>
      ),
    },
    {
      key: "Name",
      label: "Product Name",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
          {val}
        </span>
      ),
    },
    {
      key: "Price",
      label: "Unit Price",
      width: "160px",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: "var(--primary)" }}>
          NRs. {Number(val || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "Quantity",
      label: "Stock Status",
      width: "180px",
      sortable: true,
      render: (val) => {
        const qty = Number(val) || 0;
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

  // Delete product handler (accepts optional specific ID or currently selected row)
  const deleteProduct = (idToDelete) => {
    const targetId = idToDelete || selectedRowID;
    if (!targetId) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    api
      .delete("/delete/" + targetId)
      .then(() => {
        toast.success("Product deleted successfully!");
        if (selectedRowID === targetId) {
          setSelectedRowID("");
        }
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
                width: "64px",
                height: "64px",
                background: "#eef2ff",
                color: "var(--primary)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                margin: "0 auto 1.25rem",
              }}
            >
              <i className="fa fa-boxes-stacked"></i>
            </div>
            <h3 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>
              StoreFlow Inventory
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
              }}
            >
              Sign in to manage your inventory catalog, monitor stock thresholds, and record sales in real time.
            </p>
            <a href="/" className="btn-modern btn-primary-modern" style={{ display: "inline-flex" }}>
              <i className="fa fa-arrow-right-to-bracket"></i> Sign In to StoreFlow
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="fa fa-boxes-stacked" style={{ color: "var(--primary)" }}></i>
            Products & Inventory
          </h1>
          <p className="page-subtitle">
            Manage your store&apos;s product catalog, live stock status, and pricing.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsAddModalOpen(true);
            }}
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
            onClick={() => deleteProduct()}
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
          subtitle="Items with ≤ 5 units"
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

      {/* Search Bar & Stats */}
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
              title="Clear search"
            >
              <i className="fa fa-times-circle"></i>
            </button>
          )}
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing <strong>{filteredProducts.length}</strong> of{" "}
          <strong>{products.length}</strong> items
        </div>
      </div>

      {/* Responsive Custom SaaS Data Table (Replaced AG Grid) */}
      <ResponsiveDataTable
        columns={columns}
        data={filteredProducts}
        keyField="ID"
        selectedId={selectedRowID}
        onSelect={(product) => setSelectedRowID(product.ID)}
        exportFileName="StoreFlow-Products"
        emptyTitle="No products found"
        emptyMessage={
          searchTerm
            ? `No products matched "${searchTerm}". Try clearing your search filter.`
            : "Your inventory is currently empty. Click 'Add Product' above to create your first item!"
        }
        renderMobileHeader={(p) => {
          const qty = Number(p.Quantity) || 0;
          let badgeClass = "badge-in-stock";
          let label = `${qty} in stock`;
          if (qty <= 0) {
            badgeClass = "badge-out-stock";
            label = `Out of stock`;
          } else if (qty <= 5) {
            badgeClass = "badge-low-stock";
            label = `Low stock (${qty})`;
          }
          return {
            title: p.Name,
            subtitle: `SKU #${p.ID}`,
            badge: <span className={`badge-status ${badgeClass}`}>{label}</span>,
          };
        }}
        renderActions={(row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.4rem",
            }}
          >
            <button
              type="button"
              className="btn-modern btn-secondary-modern"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}
              onClick={(e) => {
                e.stopPropagation();
                setProductToEdit(row);
                setIsAddModalOpen(true);
              }}
              title="Edit Product"
            >
              <i className="fa fa-pen-to-square"></i> Edit
            </button>
            <button
              type="button"
              className="btn-modern btn-danger-modern"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}
              onClick={(e) => {
                e.stopPropagation();
                deleteProduct(row.ID);
              }}
              title="Delete Product"
            >
              <i className="fa fa-trash-alt"></i>
            </button>
          </div>
        )}
      />

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        productToEdit={productToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        onProductAdded={fetchProducts}
      />
    </div>
  );
}

export default ShowAllProducts;
