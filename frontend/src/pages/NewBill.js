import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../services/api";
import { useToast } from "../context/ToastContext";

const NewBilling = () => {
  const [items, setItems] = useState([
    { Name: "", Price: 0, Quantity: 1, Total: 0 },
  ]);
  const [catalog, setCatalog] = useState([]);
  const [invoiceNumber] = useState(
    () => `INV-${Date.now().toString().slice(-6)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableRef = useRef();
  const { user, isAuthenticated, isLoading } = useAuth();
  const api = useApi();
  const toast = useToast();

  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const catalogInFlightRef = useRef(false);

  // Fetch product catalog for auto-fill
  const fetchCatalog = useCallback(async () => {
    if (!isAuthenticated) return;
    if (catalogInFlightRef.current) return;
    catalogInFlightRef.current = true;
    try {
      const response = await api.get("/products");
      setCatalog(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching catalog for billing:", err);
    } finally {
      catalogInFlightRef.current = false;
    }
  }, [api, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCatalog();
    }
  }, [isAuthenticated, fetchCatalog]);

  // Add new billing item row
  const addRow = () => {
    setItems((prev) => [...prev, { Name: "", Price: 0, Quantity: 1, Total: 0 }]);
  };

  // Remove billing item row
  const removeRow = (index) => {
    if (items.length <= 1) {
      setItems([{ Name: "", Price: 0, Quantity: 1, Total: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle product name change and auto-fill price
  const handleNameChange = (index, value) => {
    const list = [...items];
    list[index].Name = value;

    // Check if entered name matches an item in catalog
    const matched = catalog.find(
      (c) => c.Name.trim().toLowerCase() === value.trim().toLowerCase()
    );

    if (matched) {
      list[index].Price = Number(matched.Price) || 0;
      list[index].Total = (Number(matched.Price) || 0) * (Number(list[index].Quantity) || 0);
    } else {
      list[index].Total = (Number(list[index].Price) || 0) * (Number(list[index].Quantity) || 0);
    }

    setItems(list);
  };

  // Handle price or quantity numeric changes
  const handleFieldChange = (index, field, value) => {
    const list = [...items];
    const numVal = parseFloat(value) || 0;
    list[index][field] = numVal;

    const price = field === "Price" ? numVal : Number(list[index].Price) || 0;
    const qty = field === "Quantity" ? numVal : Number(list[index].Quantity) || 0;
    list[index].Total = price * qty;

    setItems(list);
  };

  // Calculate bill total
  const grandTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.Total) || 0), 0);
  }, [items]);

  // Submit bill and record sales
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out rows with empty product name
    const validItems = items.filter((item) => item.Name.trim() !== "");
    if (validItems.length === 0) {
      toast.warning("Please add at least one product with a valid name.");
      return;
    }

    // Verify stock availability
    for (const item of validItems) {
      const match = catalog.find(
        (c) => c.Name.trim().toLowerCase() === item.Name.trim().toLowerCase()
      );
      if (match && Number(item.Quantity) > Number(match.Quantity)) {
        toast.warning(
          `Warning: ${item.Name} quantity (${item.Quantity}) exceeds available stock (${match.Quantity}).`
        );
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Decrement inventory stock atomically
      await api.put("/updateAfterBill", validItems);

      // 2. Record sales entries
      await api.post("/addSales", validItems);

      toast.success("Bill completed! Stock decremented and sales logged.");
      setItems([{ Name: "", Price: 0, Quantity: 1, Total: 0 }]);
      fetchCatalog(); // Refresh catalog stock counts
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to process bill";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print receipt function
  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <i
          className="fa fa-circle-notch fa-spin"
          style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1rem" }}
        ></i>
        <h4 style={{ color: "var(--text-muted)" }}>Loading billing terminal...</h4>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h3>Please log in to access the billing terminal.</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="fa fa-receipt" style={{ color: "var(--primary)" }}></i>
            POS Billing Terminal
          </h1>
          <p className="page-subtitle">
            Generate invoices, auto-fill unit prices, deduct inventory stock, and record sales.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-modern btn-secondary-modern"
          >
            <i className="fa fa-print"></i> Print Receipt
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-modern btn-primary-modern"
            disabled={isSubmitting || grandTotal <= 0}
          >
            {isSubmitting ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              <>
                <i className="fa fa-check-circle"></i> Complete &amp; Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Card Container */}
      <div
        className="glass-card"
        style={{ maxWidth: "920px", margin: "0 auto", padding: "2rem" }}
      >
        {/* Printable Area */}
        <div ref={tableRef} style={{ padding: "0.5rem" }}>
          {/* Invoice Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid var(--border)",
              paddingBottom: "1.25rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  letterSpacing: "-0.02em",
                }}
              >
                Store<span style={{ color: "var(--primary)" }}>Flow</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Tax Invoice &amp; Customer Receipt
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                {invoiceNumber}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Date: {currentDate}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Cashier: {user?.name || user?.email}
              </div>
            </div>
          </div>

          {/* Billing Items Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "#f8fafc",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "0.75rem 1rem", width: "40%" }}>Product Name</th>
                  <th style={{ padding: "0.75rem 1rem", width: "20%" }}>Price (NRs)</th>
                  <th style={{ padding: "0.75rem 1rem", width: "15%" }}>Qty</th>
                  <th style={{ padding: "0.75rem 1rem", width: "20%" }}>Total (NRs)</th>
                  <th style={{ padding: "0.75rem 0.5rem", width: "5%" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const matchedCatalogItem = catalog.find(
                    (c) => c.Name.trim().toLowerCase() === item.Name.trim().toLowerCase()
                  );

                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <input
                          list={`catalog-list-${index}`}
                          type="text"
                          className="form-control-modern"
                          placeholder="Select or type product..."
                          value={item.Name}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                        />
                        <datalist id={`catalog-list-${index}`}>
                          {catalog.map((c) => (
                            <option key={c.ID} value={c.Name}>
                              NRs. {Number(c.Price).toFixed(2)} &mdash; Stock: {c.Quantity}
                            </option>
                          ))}
                        </datalist>
                        {matchedCatalogItem && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color:
                                matchedCatalogItem.Quantity > 5
                                  ? "var(--success)"
                                  : "var(--warning)",
                              marginTop: "0.2rem",
                              paddingLeft: "0.25rem",
                            }}
                          >
                            <i className="fa fa-info-circle"></i> Available Stock:{" "}
                            <strong>{matchedCatalogItem.Quantity}</strong>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control-modern"
                          value={item.Price}
                          onChange={(e) =>
                            handleFieldChange(index, "Price", e.target.value)
                          }
                        />
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          className="form-control-modern"
                          value={item.Quantity}
                          onChange={(e) =>
                            handleFieldChange(index, "Quantity", e.target.value)
                          }
                        />
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 1rem",
                          fontWeight: 700,
                          color: "var(--text-main)",
                          verticalAlign: "middle",
                        }}
                      >
                        NRs. {(Number(item.Total) || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "0.6rem 0.25rem", verticalAlign: "middle" }}>
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-light)",
                            cursor: "pointer",
                            padding: "0.4rem",
                            borderRadius: "var(--radius-sm)",
                            transition: "var(--transition)",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.color = "var(--danger)")}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = "var(--text-light)")
                          }
                          title="Remove Row"
                        >
                          <i className="fa fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "2px solid var(--border)",
              flexWrap: "wrap",
              gap: "1.5rem",
            }}
          >
            <div>
              <button
                type="button"
                onClick={addRow}
                className="btn-modern btn-secondary-modern"
                style={{ fontSize: "0.88rem" }}
              >
                <i className="fa fa-plus"></i> Add Item Line
              </button>
            </div>

            <div
              style={{
                minWidth: "260px",
                background: "#f8fafc",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>Subtotal</span>
                <span>NRs. {grandTotal.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>Tax (0%)</span>
                <span>NRs. 0.00</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.6rem",
                }}
              >
                <span>Grand Total</span>
                <span>NRs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBilling;
