import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useLanguage } from "../context/LanguageContext";
import "./ReceiptModal.css";

/**
 * ReceiptModal Component
 * Modern POS receipt preview modal with 100% free browser printing and direct vector PDF downloads.
 * Completely eliminates raw input fields, trash cans, and form artifacts from printed invoices.
 */
export default function ReceiptModal({
  isOpen,
  onClose,
  billData = null,
  onNewBill = null,
}) {
  const { t } = useLanguage();
  const [format, setFormat] = useState("standard"); // 'standard' (A4) | 'thermal' (80mm POS slip)

  if (!isOpen || !billData) return null;

  const {
    invoiceNumber = `INV-${Date.now().toString().slice(-6)}`,
    date = new Date().toLocaleDateString(),
    cashier = "Cashier",
    items = [],
    grandTotal = 0,
  } = billData;

  // Filter out any empty rows
  const validItems = items.filter((item) => item.Name && item.Name.trim() !== "");

  // Print handler using native browser print (isolated by @media print)
  const handlePrint = () => {
    window.print();
  };

  // Generate and download clean PDF invoice using jsPDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Colors
      const primaryColor = [79, 70, 229]; // #4F46E5
      const textColor = [15, 23, 42]; // #0F172A
      const mutedColor = [100, 116, 139]; // #64748B

      // Header Branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...primaryColor);
      doc.text("Gajurmukhi Veterinary", 20, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      doc.text("Veterinary Pharmacy & Animal Care Store", 20, 31);
      doc.text("Official Customer Tax Invoice", 20, 36);

      // Invoice Meta Right-aligned
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...textColor);
      doc.text(invoiceNumber, 190, 25, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...mutedColor);
      doc.text(`Date: ${date}`, 190, 31, { align: "right" });
      doc.text(`Cashier: ${cashier}`, 190, 36, { align: "right" });

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, 42, 190, 42);

      // Table Header
      let yPos = 52;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPos - 6, 170, 9, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...mutedColor);
      doc.text("#", 24, yPos);
      doc.text("ITEM DESCRIPTION", 36, yPos);
      doc.text("PRICE (NRS)", 115, yPos, { align: "right" });
      doc.text("QTY", 145, yPos, { align: "right" });
      doc.text("TOTAL (NRS)", 186, yPos, { align: "right" });

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...textColor);

      validItems.forEach((item, idx) => {
        yPos += 8;

        // Draw light bottom border for row
        doc.setDrawColor(241, 245, 249);
        doc.line(20, yPos + 3, 190, yPos + 3);

        const price = Number(item.Price) || 0;
        const qty = Number(item.Quantity) || 0;
        const total = Number(item.Total) || price * qty;

        doc.text(String(idx + 1), 24, yPos);
        doc.text(item.Name, 36, yPos);
        doc.text(price.toFixed(2), 115, yPos, { align: "right" });
        doc.text(String(qty), 145, yPos, { align: "right" });
        doc.text(total.toFixed(2), 186, yPos, { align: "right" });
      });

      // Summary Box
      yPos += 14;
      doc.setDrawColor(226, 232, 240);
      doc.line(125, yPos, 190, yPos);

      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...mutedColor);
      doc.text("Subtotal:", 130, yPos);
      doc.text(`NRs. ${Number(grandTotal).toFixed(2)}`, 186, yPos, { align: "right" });

      yPos += 6;
      doc.text("Tax / VAT (0%):", 130, yPos);
      doc.text("NRs. 0.00", 186, yPos, { align: "right" });

      yPos += 8;
      doc.setDrawColor(...textColor);
      doc.setLineWidth(0.8);
      doc.line(125, yPos - 2, 190, yPos - 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text("Grand Total:", 130, yPos + 3);
      doc.text(`NRs. ${Number(grandTotal).toFixed(2)}`, 186, yPos + 3, { align: "right" });

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...mutedColor);
      doc.text("Thank you for your business! Please visit us again.", 105, 275, {
        align: "center",
      });
      doc.text("Powered by Gajurmukhi Veterinary Management", 105, 280, {
        align: "center",
      });

      // Trigger download
      doc.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Could not generate PDF. Please try the Print button instead.");
    }
  };

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Toolbar (Hidden in Print) */}
        <div className="receipt-modal-toolbar">
          <div className="receipt-format-pills">
            <button
              type="button"
              className={`format-pill-btn ${format === "standard" ? "active" : ""}`}
              onClick={() => setFormat("standard")}
              title={t("receiptStandard")}
            >
              <i className="fa fa-file-invoice"></i>
              <span>{t("receiptStandard")}</span>
            </button>
            <button
              type="button"
              className={`format-pill-btn ${format === "thermal" ? "active" : ""}`}
              onClick={() => setFormat("thermal")}
              title={t("receiptThermal")}
            >
              <i className="fa fa-receipt"></i>
              <span>{t("receiptThermal")}</span>
            </button>
          </div>

          <div className="receipt-toolbar-actions">
            <button
              type="button"
              className="btn-modern btn-secondary-modern"
              onClick={handleDownloadPDF}
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
              title="Download clean PDF invoice"
            >
              <i className="fa fa-download" style={{ color: "var(--primary)" }}></i>
              <span>{t("downloadPDF")}</span>
            </button>

            <button
              type="button"
              className="btn-modern btn-primary-modern"
              onClick={handlePrint}
              style={{ padding: "0.45rem 0.95rem", fontSize: "0.85rem" }}
              title="Print directly to printer"
            >
              <i className="fa fa-print"></i>
              <span>{t("print")}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.3rem",
                color: "var(--text-muted, #64748b)",
                cursor: "pointer",
                padding: "0 0.4rem",
              }}
              title={t("close")}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="receipt-modal-body">
          {/* Authentic Clean Receipt Canvas (Pure text & typography) */}
          <div className={`receipt-paper format-${format}`}>
            {/* Header */}
            <div className="receipt-header">
              <div className="receipt-brand-row">
                <div>
                  <div className="receipt-brand-name">
                    {t("brandName")}<span> {t("brandSubtitle")}</span>
                  </div>
                  <div className="receipt-subtitle">
                    {t("receiptSubtitle")}
                  </div>
                </div>

                <div className="receipt-meta-box">
                  <div className="receipt-inv-number">{invoiceNumber}</div>
                  <div>{t("date")}: {date}</div>
                  <div>{t("cashier")}: {cashier}</div>
                </div>
              </div>
            </div>

            {/* Product Items Table */}
            <table className="receipt-table">
              <thead>
                <tr>
                  <th style={{ width: "8%" }}>#</th>
                  <th style={{ width: "45%" }}>{t("itemCol")}</th>
                  <th className="col-right" style={{ width: "17%" }}>{t("unitPrice")}</th>
                  <th className="col-center" style={{ width: "12%" }}>{t("piecesQty")}</th>
                  <th className="col-right" style={{ width: "18%" }}>{t("lineTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {validItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "1.5rem" }}>
                      {t("noItemsInInvoice")}
                    </td>
                  </tr>
                ) : (
                  validItems.map((item, idx) => {
                    const price = Number(item.Price) || 0;
                    const qty = Number(item.Quantity) || 0;
                    const total = Number(item.Total) || price * qty;

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{item.Name}</td>
                        <td className="col-right">NRs. {price.toFixed(2)}</td>
                        <td className="col-center">{qty}</td>
                        <td className="col-right" style={{ fontWeight: 700 }}>
                          NRs. {total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Totals Breakdown */}
            <div className="receipt-summary-container">
              <div className="receipt-summary-box">
                <div className="receipt-summary-line">
                  <span>{t("subtotal")}:</span>
                  <span>NRs. {Number(grandTotal).toFixed(2)}</span>
                </div>
                <div className="receipt-summary-line">
                  <span>{t("taxZero")}:</span>
                  <span>NRs. 0.00</span>
                </div>
                <div className="receipt-summary-total">
                  <span>{t("grandTotalPayable")}:</span>
                  <span>NRs. {Number(grandTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Clean Store Footer */}
            <div className="receipt-footer">
              <p style={{ margin: "0 0 0.3rem 0", fontWeight: 600 }}>
                {t("thankYouShopping")}
              </p>
              <p style={{ margin: 0, fontSize: "0.74rem", color: "#94a3b8" }}>
                {t("systemGenerated")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
