import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import ReceiptModal from "../components/ReceiptModal";

const NewBilling = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState([
    { Name: "", Price: 0, Quantity: 1, Total: 0 },
  ]);
  const [catalog, setCatalog] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `INV-${Date.now().toString().slice(-6)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptBillData, setReceiptBillData] = useState(null);

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
    if (value === "") {
      list[index][field] = "";
      list[index].Total = 0;
      setItems(list);
      return;
    }

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

  // Preview / Print Receipt before checkout
  const handleOpenReceiptPreview = () => {
    const validItems = items.filter((item) => item.Name.trim() !== "");
    if (validItems.length === 0) {
      toast.warning("Please add at least one product before previewing receipt.");
      return;
    }

    setReceiptBillData({
      invoiceNumber,
      date: currentDate,
      cashier: user?.name || user?.email || "Cashier",
      items: validItems,
      grandTotal,
    });
    setIsReceiptModalOpen(true);
  };

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

      // Automatically open clean receipt modal for instant printing or PDF download
      setReceiptBillData({
        invoiceNumber,
        date: currentDate,
        cashier: user?.name || user?.email || "Cashier",
        items: validItems,
        grandTotal,
      });
      setIsReceiptModalOpen(true);

      // Reset state for next customer
      setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
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
            {t("posHeaderTitle")}
          </h1>
          <p className="page-subtitle">
            {t("posHeaderSubtitle")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleOpenReceiptPreview}
            className="btn-modern btn-secondary-modern"
            disabled={grandTotal <= 0}
            title={t("previewReceipt")}
          >
            <i className="fa fa-receipt"></i> {t("previewReceipt")}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="btn-modern btn-primary-modern"
            disabled={isSubmitting || grandTotal <= 0}
            title={t("completeBill")}
          >
            {isSubmitting ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> {t("processingCheckout")}
              </>
            ) : (
              <>
                <i className="fa fa-check-circle"></i> {t("completeBill")}
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
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.02em",
              }}
            >
              {t("brandName")}<span style={{ color: "var(--primary)" }}> {t("brandSubtitle")}</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {t("posHeaderTitle")}
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
              {t("date")}: {currentDate}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {t("cashier")}: {user?.name || user?.email}
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
                <th style={{ padding: "0.75rem 1rem", width: "40%" }}>{t("productName")}</th>
                <th style={{ padding: "0.75rem 1rem", width: "20%" }}>{t("unitPrice")}</th>
                <th style={{ padding: "0.75rem 1rem", width: "15%" }}>{t("piecesQty")}</th>
                <th style={{ padding: "0.75rem 1rem", width: "20%" }}>{t("lineTotal")}</th>
                <th style={{ padding: "0.75rem 0.5rem", width: "5%" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const matchedCatalogItem = catalog.find(
                  (c) => c.Name.trim().toLowerCase() === item.Name.trim().toLowerCase()
                );

                // Calculate total quantity of this specific product being purchased across all rows
                const totalBilledPieces = matchedCatalogItem
                  ? items
                      .filter(
                        (it) =>
                          it.Name &&
                          it.Name.trim().toLowerCase() ===
                            matchedCatalogItem.Name.trim().toLowerCase()
                      )
                      .reduce((sum, it) => sum + (Number(it.Quantity) || 0), 0)
                  : 0;

                const initialStock = matchedCatalogItem
                  ? Number(matchedCatalogItem.Quantity) || 0
                  : 0;
                const liveRemainingStock = initialStock - totalBilledPieces;
                const isExceeded = matchedCatalogItem && liveRemainingStock < 0;
                const isLowStock =
                  matchedCatalogItem && liveRemainingStock <= 5 && liveRemainingStock >= 0;

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
                        placeholder={t("selectOrTypeProduct")}
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
                            color: isExceeded
                              ? "var(--danger)"
                              : isLowStock
                              ? "var(--warning)"
                              : "var(--success)",
                            marginTop: "0.25rem",
                            paddingLeft: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            fontWeight: 600,
                          }}
                        >
                          <i
                            className={`fa ${
                              isExceeded
                                ? "fa-triangle-exclamation"
                                : isLowStock
                                ? "fa-circle-exclamation"
                                : "fa-cubes"
                            }`}
                          ></i>
                          <span>
                            {t("availableStock")} <strong>{liveRemainingStock}</strong> {t("remaining")}
                            <span style={{ color: "var(--text-muted)", marginLeft: "0.3rem", fontWeight: 400 }}>
                              ({t("initialStock")} {initialStock})
                            </span>
                            {isExceeded && (
                              <span style={{ color: "var(--danger)", marginLeft: "0.3rem" }}>
                                &bull; {t("exceedsStock", { count: Math.abs(liveRemainingStock) })}
                              </span>
                            )}
                          </span>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Number(item.Quantity) || 0;
                            if (cur > 1) {
                              handleFieldChange(index, "Quantity", cur - 1);
                            }
                          }}
                          className="btn-modern btn-secondary-modern"
                          style={{
                            padding: "0.4rem 0.55rem",
                            fontSize: "0.75rem",
                            height: "36px",
                            minWidth: "30px",
                          }}
                          title="Decrease 1 piece"
                          disabled={Number(item.Quantity) <= 1}
                        >
                          <i className="fa fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          className="form-control-modern"
                          style={{
                            textAlign: "center",
                            borderColor: isExceeded ? "var(--danger)" : undefined,
                            fontWeight: 600,
                          }}
                          value={item.Quantity}
                          onChange={(e) =>
                            handleFieldChange(index, "Quantity", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Number(item.Quantity) || 0;
                            handleFieldChange(index, "Quantity", cur + 1);
                          }}
                          className="btn-modern btn-secondary-modern"
                          style={{
                            padding: "0.4rem 0.55rem",
                            fontSize: "0.75rem",
                            height: "36px",
                            minWidth: "30px",
                          }}
                          title="Increase 1 piece"
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                      </div>
                      {isExceeded && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--danger)",
                            fontWeight: 600,
                            marginTop: "0.2rem",
                            textAlign: "center",
                          }}
                        >
                          {t("overBy", { count: Math.abs(liveRemainingStock) })}
                        </div>
                      )}
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
              <i className="fa fa-plus"></i> {t("addItemRow")}
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
              <span>{t("subtotal")}</span>
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
              <span>{t("taxZero")}</span>
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
              <span>{t("grandTotal")}</span>
              <span>NRs. {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Receipt Preview & Print Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        billData={receiptBillData}
      />
    </div>
  );
};

export default NewBilling;
