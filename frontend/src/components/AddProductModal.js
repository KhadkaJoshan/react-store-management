import React, { useState, useEffect, useRef } from "react";
import { useApi, getBackendHealthUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";

const AddProductModal = ({
  isOpen,
  onClose,
  onProductAdded,
  productToEdit = null,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [addedCount, setAddedCount] = useState(0);

  // Persistent entry mode: 'single' | 'multiple'
  const [entryMode, setEntryMode] = useState(() => {
    return localStorage.getItem("storeflow_add_mode") || "single";
  });

  const api = useApi();
  const toast = useToast();
  const nameInputRef = useRef(null);

  const isEditMode = !!productToEdit;

  // Sync state when modal opens or productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.Name || "");
      setPrice(productToEdit.Price !== undefined ? String(productToEdit.Price) : "");
      setQuantity(
        productToEdit.Quantity !== undefined ? String(productToEdit.Quantity) : ""
      );
    } else {
      setName("");
      setPrice("");
      setQuantity("");
    }
    setError("");
    setAddedCount(0);

    // Auto-focus the name input when modal opens
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleModeChange = (mode) => {
    setEntryMode(mode);
    localStorage.setItem("storeflow_add_mode", mode);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Product name is required.");
      nameInputRef.current?.focus();
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a valid number greater than or equal to 0.");
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty)) {
      setError("Quantity must be a valid integer.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.put("/update/" + productToEdit.ID, {
          Name: trimmedName,
          Price: parsedPrice,
          Quantity: parsedQty,
        });
        toast.success(`Product "${trimmedName}" updated successfully!`);
        onProductAdded();
        onClose();
      } else {
        await api.post("/addproducts", {
          Name: trimmedName,
          Price: parsedPrice,
          Quantity: parsedQty,
        });

        toast.success(`Added "${trimmedName}" (NRs. ${parsedPrice.toFixed(2)})!`);
        onProductAdded();

        if (entryMode === "multiple") {
          // Continuous Entry Mode: clear fields, increment counter, refocus Product Name
          setAddedCount((prev) => prev + 1);
          setName("");
          setPrice("");
          setQuantity("");
          setTimeout(() => {
            nameInputRef.current?.focus();
          }, 50);
        } else {
          // Single Product Mode: close modal
          setName("");
          setPrice("");
          setQuantity("");
          onClose();
        }
      }
    } catch (err) {
      const isNetworkError = err.message === "Network Error" || !err.response;
      let serverErr =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.error;

      if (!serverErr && isNetworkError) {
        serverErr =
          "Network Error: Unable to reach backend server. Please ensure backend SSL certificate is authorized.";
      } else if (!serverErr) {
        serverErr =
          err.message ||
          (isEditMode ? "Failed to update product." : "Failed to add product.");
      }
      setError(serverErr);
      toast.error(serverErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <i
              className={`fa ${isEditMode ? "fa-pen-to-square" : "fa-box-open"}`}
              style={{ color: "var(--primary)", marginRight: "0.5rem" }}
            ></i>
            {isEditMode ? t("modalEditTitle") : t("modalAddTitle")}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.25rem",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
            title={t("close")}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Single vs Multiple Mode Switcher (only shown when adding new items) */}
            {!isEditMode && (
              <>
                <div className="mode-switch-wrapper">
                  <button
                    type="button"
                    className={`mode-switch-btn ${
                      entryMode === "single" ? "active" : ""
                    }`}
                    onClick={() => handleModeChange("single")}
                  >
                    <i className="fa fa-box"></i>
                    <span>{t("singleProduct")}</span>
                  </button>

                  <button
                    type="button"
                    className={`mode-switch-btn ${
                      entryMode === "multiple" ? "active" : ""
                    }`}
                    onClick={() => handleModeChange("multiple")}
                  >
                    <i
                      className="fa fa-bolt"
                      style={{
                        color: entryMode === "multiple" ? "var(--primary)" : "inherit",
                      }}
                    ></i>
                    <span>{t("batchEntry")}</span>
                  </button>
                </div>

                {entryMode === "multiple" && (
                  <div className="batch-info-banner">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                      }}
                    >
                      <i className="fa fa-keyboard"></i>
                      <span>
                        <strong>{t("continuousModeTitle")}</strong> {t("continuousModeHint")}
                      </span>
                    </div>
                    {addedCount > 0 && (
                      <span className="batch-counter-badge">
                        <i className="fa fa-check"></i> {t("addedCountBadge", { count: addedCount })}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Error Message if any */}
            {error && (
              <div
                style={{
                  background: "#fff1f2",
                  color: "#9f1239",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                  border: "1px solid #fecdd3",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <i
                    className="fa fa-circle-exclamation"
                    style={{ color: "#e11d48" }}
                  ></i>
                  <span style={{ fontWeight: 600 }}>{error}</span>
                </div>
                {error.toLowerCase().includes("network") &&
                  typeof window !== "undefined" &&
                  window.location.protocol === "https:" && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
                      Please authorize the local backend SSL certificate:
                      <a
                        href={getBackendHealthUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "0.3rem",
                          color: "#e11d48",
                          fontWeight: 700,
                          textDecoration: "underline",
                        }}
                      >
                        Authorize Backend Certificate &rarr;
                      </a>
                    </div>
                  )}
              </div>
            )}

            {/* Product Inputs */}
            <div className="form-group">
              <label className="form-label">
                {t("labelProductName")} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                className="form-control-modern"
                placeholder={t("placeholderProductName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  {t("labelPrice")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control-modern"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t("labelQuantity")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  className="form-control-modern"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="modal-footer">
            {entryMode === "multiple" && !isEditMode ? (
              <>
                <button
                  type="button"
                  className="btn-modern btn-secondary-modern"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  <i className="fa fa-check"></i> {t("done")} {addedCount > 0 ? `(${addedCount})` : ""}
                </button>
                <button
                  type="submit"
                  className="btn-modern btn-primary-modern"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> {t("saving")}
                    </>
                  ) : (
                    <>
                      <i className="fa fa-arrow-right"></i> {t("saveAndNext")}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-modern btn-secondary-modern"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-modern btn-primary-modern"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i>{" "}
                      {isEditMode ? t("updating") : t("saving")}
                    </>
                  ) : (
                    <>
                      <i className={`fa ${isEditMode ? "fa-check" : "fa-plus"}`}></i>{" "}
                      {isEditMode ? t("updateProduct") : `${t("save")} (Enter ↵)`}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
