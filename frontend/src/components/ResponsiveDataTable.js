import React, { useState, useMemo } from "react";
import "./ResponsiveDataTable.css";
import { useLanguage } from "../context/LanguageContext";

/**
 * ResponsiveDataTable
 * High-performance, mobile-first responsive table component designed for Gajurmukhi Veterinary.
 * Renders as a crisp, interactive table on desktop/tablet (>=768px) and automatically
 * adapts into clean, touch-friendly product/sales cards on mobile viewports (<768px).
 */
export default function ResponsiveDataTable({
  columns = [],
  data = [],
  keyField = "id",
  selectedId = null,
  onSelect = null,
  emptyTitle = "No records found",
  emptyMessage = "There are no items matching your criteria.",
  exportFileName = "storeflow-export",
  renderActions = null,
  renderMobileHeader = null,
  initialPageSize = 10,
}) {
  const { t } = useLanguage();
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sorting Handler
  const handleSort = (key, isSortable) => {
    if (isSortable === false) return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to page 1 on sort
  };

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle null or undefined
      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      // Numeric comparison
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB) && typeof valA !== "boolean" && typeof valB !== "boolean") {
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      // String comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortKey, sortDirection]);

  // Pagination Calculations
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    // Filter out columns without key or label
    const exportableCols = columns.filter((col) => col.key && col.label);
    const headers = exportableCols.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

    const rows = sortedData.map((row) => {
      return exportableCols
        .map((col) => {
          let cellVal = row[col.key];
          if (cellVal === null || cellVal === undefined) cellVal = "";
          return `"${String(cellVal).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    // UTF-8 BOM for Excel compatibility with international characters
    const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${exportFileName}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate visible page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, validCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [validCurrentPage, totalPages]);

  return (
    <div className="responsive-table-container">
      {/* Top Table Toolbar */}
      <div className="responsive-table-toolbar">
        <div className="responsive-table-stats">
          {t("tableShowing", {
            from: Math.min(totalItems, (validCurrentPage - 1) * pageSize + 1),
            to: Math.min(totalItems, validCurrentPage * pageSize),
            total: totalItems,
          })}
        </div>

        <div className="responsive-table-actions">
          {data.length > 0 && (
            <button
              type="button"
              className="btn-table-export"
              onClick={handleExportCSV}
              title="Export filtered records to CSV"
            >
              <i className="fa fa-file-excel" style={{ color: "#10b981" }}></i>
              <span>{t("exportCSV")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="responsive-table-wrapper">
        <table className="modern-data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable !== false;
                const isCurrentSort = sortKey === col.key;
                return (
                  <th
                    key={col.key || col.label}
                    className={isSortable ? "sortable" : ""}
                    style={{ width: col.width, textAlign: col.align || "left" }}
                    onClick={() => handleSort(col.key, isSortable)}
                  >
                    <span>{col.label}</span>
                    {isSortable && (
                      <span className={`sort-icon ${isCurrentSort ? "active" : ""}`}>
                        {isCurrentSort ? (
                           sortDirection === "asc" ? (
                            <i className="fa fa-arrow-up"></i>
                          ) : (
                            <i className="fa fa-arrow-down"></i>
                          )
                        ) : (
                          <i className="fa fa-sort"></i>
                        )}
                      </span>
                    )}
                  </th>
                );
              })}
              {renderActions && (
                <th style={{ width: "110px", textAlign: "right" }}>{t("actions")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  style={{ padding: 0 }}
                >
                  <div className="table-empty-state">
                    <i className="fa fa-inbox"></i>
                    <h5>{emptyTitle}</h5>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const rowKey = row[keyField];
                const isSelected = selectedId !== null && String(selectedId) === String(rowKey);
                return (
                  <tr
                    key={rowKey}
                    className={isSelected ? "row-selected" : ""}
                    onClick={() => onSelect && onSelect(row)}
                  >
                    {columns.map((col) => {
                      const cellValue = row[col.key];
                      return (
                        <td
                          key={col.key || col.label}
                          style={{ textAlign: col.align || "left" }}
                        >
                          {col.render ? col.render(cellValue, row) : cellValue}
                        </td>
                      );
                    })}
                    {renderActions && (
                      <td
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (<768px) */}
      <div className="mobile-card-list">
        {paginatedData.length === 0 ? (
          <div className="table-empty-state">
            <i className="fa fa-inbox"></i>
            <h5>{emptyTitle}</h5>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          paginatedData.map((row) => {
            const rowKey = row[keyField];
            const isSelected = selectedId !== null && String(selectedId) === String(rowKey);

            // Custom mobile header or auto-derived
            const customHeader = renderMobileHeader ? renderMobileHeader(row) : null;

            return (
              <div
                key={rowKey}
                className={`mobile-table-card ${isSelected ? "card-selected" : ""}`}
                onClick={() => onSelect && onSelect(row)}
              >
                {/* Header */}
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">
                      {customHeader?.title || row.Name || row.productName || row.SName || `#${rowKey}`}
                    </div>
                    {customHeader?.subtitle && (
                      <div className="mobile-card-sku">{customHeader.subtitle}</div>
                    )}
                  </div>
                  {customHeader?.badge && <div>{customHeader.badge}</div>}
                </div>

                {/* Details Grid */}
                <div className="mobile-card-grid">
                  {columns
                    .filter((col) => !col.hideOnMobile)
                    .map((col) => {
                      const cellValue = row[col.key];
                      return (
                        <div key={col.key || col.label} className="mobile-field-item">
                          <span className="mobile-field-label">{col.label}</span>
                          <span className="mobile-field-value">
                            {col.render ? col.render(cellValue, row) : cellValue}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Mobile Actions */}
                {renderActions && (
                  <div
                    className="mobile-card-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderActions(row)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Responsive Pagination Bar */}
      {totalPages > 1 && (
        <div className="responsive-table-footer">
          <div className="page-size-selector">
            <span>{t("rowsPerPage")}</span>
            <select
              className="page-size-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              <i className="fa fa-chevron-left"></i>
            </button>

            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                className={`btn-page ${num === validCurrentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              className="btn-page"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
