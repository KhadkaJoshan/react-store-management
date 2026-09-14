import React, { useState } from "react";
import { useApi, getBackendHealthUrl } from "../services/api";
import { useToast } from "../context/ToastContext";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const api = useApi();
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
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
      await api.post("/addproducts", {
        Name: name.trim(),
        Price: parsedPrice,
        Quantity: parsedQty,
      });

      toast.success(`Product "${name.trim()}" added successfully!`);
      setName("");
      setPrice("");
      setQuantity("");
      onProductAdded();
      onClose();
    } catch (err) {
      const isNetworkError = err.message === "Network Error" || !err.response;
      let serverErr =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.error;

      if (!serverErr && isNetworkError) {
        serverErr =
          "Network Error: Unable to reach backend server. Please ensure backend SSL certificate is authorized.";
      } else if (!serverErr) {
        serverErr = err.message || "Failed to add product.";
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
        <div className="modal-header">
          <div className="modal-title">
            <i
              className="fa fa-box-open"
              style={{ color: "var(--primary)", marginRight: "0.5rem" }}
            ></i>
            Add New Product
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
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="fa fa-circle-exclamation" style={{ color: "#e11d48" }}></i>
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

            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control-modern"
                placeholder="e.g. Wireless Mouse, Milk, Coffee Beans"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Unit Price (NRs)</label>
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
                <label className="form-label">Initial Stock Quantity</label>
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

          <div className="modal-footer">
            <button
              type="button"
              className="btn-modern btn-secondary-modern"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modern btn-primary-modern"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa fa-plus"></i> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
