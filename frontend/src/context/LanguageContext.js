import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const translations = {
  en: {
    // Brand
    brandName: "Gajurmukhi",
    brandSubtitle: "Veterinary",
    brandTagline: "Veterinary Pharmacy & POS",
    footerText: "Veterinary Inventory Management & POS Solution.",

    // Navbar
    navProducts: "Products",
    navNewBill: "New Bill",
    navSalesReport: "Sales Report",
    navLogOut: "Log Out",
    navSystemOnline: "System Operational",

    // Common Buttons & Actions
    refresh: "Refresh",
    refreshing: "Refreshing...",
    search: "Search",
    clear: "Clear",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    updating: "Updating...",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    downloadPDF: "PDF",
    print: "Print",
    close: "Close",
    exportCSV: "Export CSV",
    actions: "Actions",
    tableShowing: "Showing {from} to {to} of {total} entries",
    rowsPerPage: "Rows per page:",

    // Products Page
    catalogTitle: "Inventory & Veterinary Pharmacy",
    catalogSubtitle: "Track medicine stock, pricing, and active catalog products.",
    addProduct: "Add Product",
    batchEntry: "Multiple (Continuous)",
    singleProduct: "Single Product",
    totalProducts: "Total Products",
    totalStockUnits: "Total Stock Units",
    inventoryValuation: "Inventory Valuation",
    lowStockAlerts: "Low Stock Alerts",
    activeSKUs: "Active SKUs in catalog",
    totalAvailableItems: "Total available items",
    grossCatalogValue: "Gross catalog value",
    lowStockWarningThreshold: "Items with ≤ 5 units",
    searchProductsPlaceholder: "Search medicine or product name...",
    showingProducts: "Showing {count} of {total} products",
    productName: "Product Name",
    unitPrice: "Price (NRs)",
    stockQuantity: "Stock Qty",
    status: "Status",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    noProductsFound: "No products found",
    noProductsMatch: 'No products matched "{term}". Try clearing your search filter.',
    inventoryEmpty: "Your inventory is currently empty. Click 'Add Product' above to create your first item!",
    confirmDelete: "Are you sure you want to delete {name}?",
    productAddedSuccess: "Product added successfully!",
    productUpdatedSuccess: "Product updated successfully!",
    productDeletedSuccess: "Product deleted successfully!",

    // Product Modal
    modalAddTitle: "Add New Medicine / Product",
    modalEditTitle: "Edit Product Details",
    labelProductName: "Medicine / Product Name",
    labelPrice: "Unit Price (NRs)",
    labelQuantity: "Stock Quantity (Pieces)",
    placeholderProductName: "e.g. Paracetamol Vet, Albendazole...",
    savingProduct: "Saving...",
    saveChanges: "Save Changes",
    done: "Done",
    saveAndNext: "Save & Next (Enter ↵)",
    updateProduct: "Update Product",
    continuousModeTitle: "Continuous Mode:",
    continuousModeHint: "Hit Enter ↵ to save & instantly enter next item.",
    addedCountBadge: "{count} added",

    // New Bill Page
    posHeaderTitle: "Tax Invoice & Customer Receipt Terminal",
    posHeaderSubtitle: "Generate invoices, auto-fill unit prices, deduct inventory stock, and record sales.",
    invoiceNumber: "Invoice #",
    cashier: "Cashier",
    date: "Date",
    addItemRow: "Add Item Line",
    clearBill: "Clear Bill",
    previewReceipt: "Preview Receipt",
    completeBill: "Complete & Save",
    processingCheckout: "Processing...",
    availableStock: "Available Stock:",
    remaining: "remaining",
    initialStock: "Initial:",
    exceedsStock: "Exceeds stock by {count}!",
    overBy: "Over by {count}",
    selectOrTypeProduct: "Select or type product...",
    piecesQty: "Qty",
    lineTotal: "Total (NRs)",
    subtotal: "Subtotal",
    taxZero: "Tax (0%)",
    grandTotal: "Grand Total",
    grandTotalPayable: "Grand Total Payable",
    itemsCount: "{count} items in current bill",
    billSuccess: "Bill completed! Stock decremented and sales logged.",
    emptyBillPrompt: "Please add at least one product before checking out.",

    // Receipt Modal
    taxInvoice: "Official Customer Tax Invoice",
    receiptSubtitle: "Veterinary Pharmacy & Animal Care Store",
    receiptPaperSubtitle: "Retail Management • Customer Tax Invoice",
    receiptThermal: "Thermal (80mm)",
    receiptStandard: "Standard A4",
    thankYouShopping: "Thank you for shopping with us! Please visit again.",
    poweredBy: "Powered by Gajurmukhi Veterinary Management",
    systemGenerated: "System generated receipt • Gajurmukhi Veterinary POS",
    itemCol: "Item",
    noItemsInInvoice: "No items in this invoice.",

    // Sales Report Page
    salesTitle: "Sales & Revenue Analytics",
    salesSubtitle: "Track checkout transactions, aggregate sales revenues, and customer purchase trends.",
    totalTransactions: "Total Transactions",
    completedCustomerOrders: "Completed customer orders",
    totalRevenue: "Total Revenue",
    cumulativeEarnings: "Cumulative sales earnings",
    totalUnitsSold: "Total Units Sold",
    itemsPurchased: "Items purchased by customers",
    avgOrderValue: "Avg Order Value",
    averagePerSale: "Average revenue per sale",
    combinedView: "Combined View",
    visualCharts: "Visual Charts",
    dataTable: "Data Table",
    period: "Period:",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    allTime: "All Time",
    peakSalesDate: "Peak Sales Date",
    peakVolume: "{amount} peak volume",
    topSellingItem: "Top Selling Item",
    avgUnitsCheckout: "Avg Units / Checkout",
    avgCartItems: "Average cart items per order",
    catalogPenetration: "Catalog Penetration",
    distinctItemsOrdered: "Distinct items ordered",
    salesTimelineTrend: "Sales Timeline Trend",
    salesTimelineSub: "Chronological volume across recorded checkout transactions",
    metricRevenue: "Revenue (NRs.)",
    metricUnits: "Units Sold",
    metricOrders: "Order Count",
    topProductsRank: "Top Products",
    rankedBySales: "Ranked by overall sales share",
    transactionBasket: "Transaction Basket Segmentation",
    basketSub: "Distribution of customer checkout totals by order value range",
    totalReceipts: "{count} Total Receipts",
    searchSalesPlaceholder: "Search by product, date, or receipt #...",
    showingSales: "Showing {count} of {total} sales transactions",
    receiptCol: "Receipt #",
    productSold: "Product Sold",
    dateOfSale: "Date of Sale",
    totalAmount: "Total Amount",

    // Login Page
    welcomeLogin: "Welcome to Gajurmukhi Veterinary",
    loginSubtitle: "Sign in with your verified account to access your inventory and POS terminal.",
    enterprisePill: "Enterprise Grade Inventory & POS Platform",
    heroTitle1: "Effortless Inventory,",
    heroTitle2: "Instant Billing.",
    heroDescription: "Track veterinary stock in real time, generate fast POS receipts, and analyze revenue with an all-in-one platform built for animal health care.",
    feature1Title: "Real-Time Stock",
    feature1Desc: "Multi-tenant veterinary catalog with stock tracking, valuation totals, and low-inventory warning alerts.",
    feature2Title: "Smart POS Billing",
    feature2Desc: "Instant unit price population, live subtotal calculation, atomic stock decrements, and receipt printing.",
    feature3Title: "Sales Intelligence",
    feature3Desc: "Automated revenue logging, historical transaction archives, average order value, and real-time sales reporting.",
    googleVerified: "Google OAuth 2.0 Verified • 256-Bit SSL Encrypted",

    // Language Toggle
    currentLanguageName: "English",
    switchLanguage: "नेपालीमा हेर्नुहोस्",
  },

  ne: {
    // Brand
    brandName: "गजुरमुखी",
    brandSubtitle: "भेटेरिनरी",
    brandTagline: "भेटेरिनरी फार्मेसी तथा पीओएस",
    footerText: "भेटेरिनरी इन्भेन्टरी व्यवस्थापन तथा पीओएस प्रणाली।",

    // Navbar
    navProducts: "सामानहरू",
    navNewBill: "नयाँ बिल",
    navSalesReport: "बिक्री रिपोर्ट",
    navLogOut: "लग आउट",
    navSystemOnline: "प्रणाली सक्रिय छ",

    // Common Buttons & Actions
    refresh: "ताजा गर्नुहोस्",
    refreshing: "लोड हुँदैछ...",
    search: "खोजी गर्नुहोस्",
    clear: "हटाउनुहोस्",
    cancel: "रद्द गर्नुहोस्",
    save: "सुरक्षित गर्नुहोस्",
    saving: "सुरक्षित हुँदैछ...",
    updating: "अद्यावधिक हुँदैछ...",
    edit: "सच्याउनुहोस्",
    delete: "हटाउनुहोस्",
    view: "हेर्नुहोस्",
    downloadPDF: "पीडीएफ",
    print: "प्रिन्ट",
    close: "बन्द गर्नुहोस्",
    exportCSV: "एक्सेल/सीएसभी",
    actions: "कार्यहरू",
    tableShowing: "{total} मध्ये {from} देखि {to} सम्म देखाइएको",
    rowsPerPage: "प्रति पृष्ठ संख्या:",

    // Products Page
    catalogTitle: "इन्भेन्टरी तथा भेटेरिनरी फार्मेसी",
    catalogSubtitle: "औषधि तथा सामानको मौज्दात, मूल्य र मौजुदा सूची व्यवस्थापन गर्नुहोस्।",
    addProduct: "नयाँ सामान थप्नुहोस्",
    batchEntry: "धेरै सामान (निरन्तर)",
    singleProduct: "एकल सामान",
    totalProducts: "कुल औषधि/सामान",
    totalStockUnits: "कुल स्टक संख्या",
    inventoryValuation: "स्टकको कुल मूल्य",
    lowStockAlerts: "न्यून स्टक चेतावनी",
    activeSKUs: "सक्रिय सामानहरूको संख्या",
    totalAvailableItems: "कुल उपलब्ध एकाइ संख्या",
    grossCatalogValue: "कुल मौज्दात रकम",
    lowStockWarningThreshold: "५ थान वा सोभन्दा कम",
    searchProductsPlaceholder: "औषधि वा सामानको नाम खोज्नुहोस्...",
    showingProducts: "{total} मध्ये {count} सामानहरू देखाइएको छ",
    productName: "सामानको नाम",
    unitPrice: "मूल्य (रु.)",
    stockQuantity: "स्टक थान",
    status: "स्थिति",
    inStock: "स्टकमा छ",
    lowStock: "न्यून स्टक",
    outOfStock: "स्टक सकियो",
    noProductsFound: "कुनै सामान फेला परेन",
    noProductsMatch: '"{term}" सँग मिल्ने सामान भेटिएन।',
    inventoryEmpty: "तपाईंको इन्भेन्टरी खाली छ। पहिलो सामान थप्न माथिको 'नयाँ सामान थप्नुहोस्' मा थिच्नुहोस्!",
    confirmDelete: "के तपाईं {name} हटाउन निश्चित हुनुहुन्छ?",
    productAddedSuccess: "नयाँ सामान सफलतापूर्वक थपियो!",
    productUpdatedSuccess: "सामानको विवरण सफलतापूर्वक अद्यावधिक गरियो!",
    productDeletedSuccess: "सामान सफलतापूर्वक हटाइयो!",

    // Product Modal
    modalAddTitle: "नयाँ औषधि / सामान थप्नुहोस्",
    modalEditTitle: "सामानको विवरण सम्पादन गर्नुहोस्",
    labelProductName: "औषधि वा सामानको नाम",
    labelPrice: "प्रति एकाइ मूल्य (रु.)",
    labelQuantity: "स्टक संख्या (थान)",
    placeholderProductName: "जस्तै: प्यारासिटामोल भेट, अल्बेन्डाजोल...",
    savingProduct: "सुरक्षित हुँदैछ...",
    saveChanges: "सुरक्षित गर्नुहोस्",
    done: "सम्पन्न",
    saveAndNext: "सुरक्षित र अर्को (Enter ↵)",
    updateProduct: "विवरण अद्यावधिक गर्नुहोस्",
    continuousModeTitle: "निरन्तर प्रविष्टि:",
    continuousModeHint: "सुरक्षित गर्न र अर्को सामान थप्न Enter ↵ थिच्नुहोस्।",
    addedCountBadge: "{count} थपियो",

    // New Bill Page
    posHeaderTitle: "कर बिजक तथा ग्राहक रसिद काउन्टर",
    posHeaderSubtitle: "बिल तयार गर्नुहोस्, स्वतः मूल्य गणना, स्टक कट्टी र बिक्री दर्ता गर्नुहोस्।",
    invoiceNumber: "बिल नं.",
    cashier: "क्यासियर",
    date: "मिति",
    addItemRow: "थप सामान थप्नुहोस्",
    clearBill: "फारम खाली गर्नुहोस्",
    previewReceipt: "रसिद हेर्नुहोस्",
    completeBill: "बिल सम्पन्न गरी सुरक्षित गर्नुहोस्",
    processingCheckout: "बिलिङ प्रक्रिया जारी छ...",
    availableStock: "उपलब्ध स्टक:",
    remaining: "बाँकी",
    initialStock: "सुरुको:",
    exceedsStock: "स्टक भन्दा {count} थान बढी भयो!",
    overBy: "{count} बढी",
    selectOrTypeProduct: "औषधि छान्नुहोस् वा लेख्नुहोस्...",
    piecesQty: "थान/संख्या",
    lineTotal: "जम्मा (रु.)",
    subtotal: "जम्मा रकम",
    taxZero: "कर (०%)",
    grandTotal: "कुल जम्मा",
    grandTotalPayable: "कुल जम्मा रकम",
    itemsCount: "हालको बिलमा {count} सामान छन्",
    billSuccess: "बिल सफलतापूर्वक सम्पन्न भयो! स्टक घटाइयो र बिक्री दर्ता भयो।",
    emptyBillPrompt: "कृपया बिल बनाउनु अगाडि कम्तीमा एउटा सामान छान्नुहोस्।",

    // Receipt Modal
    taxInvoice: "ग्राहक आधिकारिक कर बिजक",
    receiptSubtitle: "भेटेरिनरी फार्मेसी तथा पशु सेवा केन्द्र",
    receiptPaperSubtitle: "खुद्रा व्यवस्थापन • ग्राहक कर बिजक",
    receiptThermal: "थर्मल (८० मि.मी.)",
    receiptStandard: "मानक ए४",
    thankYouShopping: "हामीसँग किनमेल गर्नुभएकोमा धन्यवाद! फेरि पाल्नुहोला।",
    poweredBy: "गजुरमुखी भेटेरिनरी व्यवस्थापन प्रणालीद्वारा सञ्चालित",
    systemGenerated: "प्रणालीबाट जारी रसिद • गजुरमुखी भेटेरिनरी पीओएस",
    itemCol: "सामान",
    noItemsInInvoice: "यस बिलमा कुनै सामान छैन।",

    // Sales Report Page
    salesTitle: "बिक्री तथा आम्दानी विश्लेषण",
    salesSubtitle: "दैनिक बिक्री कारोबार, कुल आम्दानी तथा ग्राहक खरिद विवरण अनुगमन गर्नुहोस्।",
    totalTransactions: "कुल कारोबार संख्या",
    completedCustomerOrders: "सम्पन्न ग्राहक अर्डरहरू",
    totalRevenue: "कुल आम्दानी",
    cumulativeEarnings: "कुल बिक्री आम्दानी रकम",
    totalUnitsSold: "कुल बिक्री थान",
    itemsPurchased: "ग्राहकहरूले खरिद गरेको कुल संख्या",
    avgOrderValue: "औसत अर्डर रकम",
    averagePerSale: "प्रति कारोबार औसत आम्दानी",
    combinedView: "संयुक्त दृश्य",
    visualCharts: "चार्टहरू मात्र",
    dataTable: "तालिका मात्र",
    period: "समयावधि:",
    last7Days: "पछिल्लो ७ दिन",
    last30Days: "पछिल्लो ३० दिन",
    allTime: "सबै समय",
    peakSalesDate: "उच्चतम बिक्री मिति",
    peakVolume: "रु. {amount} को उच्चतम कारोबार",
    topSellingItem: "धेरै बिक्री भएको सामान",
    avgUnitsCheckout: "औसत थान / अर्डर",
    avgCartItems: "प्रति ग्राहक औसत खरिद संख्या",
    catalogPenetration: "बिक्री भएका सामानहरू",
    distinctItemsOrdered: "विभिन्न प्रकारका सामान",
    salesTimelineTrend: "बिक्री समयरेखा विश्लेषण",
    salesTimelineSub: "दैनिक ग्राहक खरिद कारोबारको कालक्रमानुसार विवरण",
    metricRevenue: "आम्दानी (रु.)",
    metricUnits: "बिक्री थान",
    metricOrders: "कारोबार संख्या",
    topProductsRank: "धेरै बिक्री भएका सामानहरू",
    rankedBySales: "कुल बिक्री हिस्साको आधारमा",
    transactionBasket: "बिल रकम वर्गीकरण",
    basketSub: "रकम सीमा अनुसार ग्राहक कारोबारहरूको विभाजन",
    totalReceipts: "कुल {count} रसिदहरू",
    searchSalesPlaceholder: "सामान, मिति वा बिल नम्बर खोजी गर्नुहोस्...",
    showingSales: "{total} मध्ये {count} बिक्री कारोबारहरू",
    receiptCol: "बिल नं.",
    productSold: "बिक्री भएको सामान",
    dateOfSale: "बिक्री मिति",
    totalAmount: "कुल रकम",

    // Login Page
    welcomeLogin: "गजुरमुखी भेटेरिनरीमा स्वागत छ",
    loginSubtitle: "इन्भेन्टरी र पीओएस प्रणाली चलाउन आफ्नो आधिकारिक खाताबाट लग इन गर्नुहोस्।",
    enterprisePill: "विश्वसनीय भेटेरिनरी इन्भेन्टरी तथा पीओएस प्लेटफर्म",
    heroTitle1: "सहज इन्भेन्टरी व्यवस्थापन,",
    heroTitle2: "तत्काल बिलिङ।",
    heroDescription: "औषधि मौज्दात वास्तविक समयमा हेर्नुहोस्, द्रुत गतिमा रसिद छाप्नुहोस्, र आफ्नो व्यवसायको बिक्री विश्लेषण गर्नुहोस्।",
    feature1Title: "तत्काल स्टक अद्यावधिक",
    feature1Desc: "औषधि मौज्दात ट्र्याकिङ, कुल मूल्य गणना र न्यून मौज्दात चेतावनी सूचना।",
    feature2Title: "स्मार्ट पीओएस बिलिङ",
    feature2Desc: "स्वतः मूल्य दाखिला, वास्तविक समयमा कुल हिसाब, स्टक कट्टी र रसिद छपाई।",
    feature3Title: "बिक्री विश्लेषण",
    feature3Desc: "स्वचालित बिक्री अभिलेख, ऐतिहासिक कारोबारहरू र वास्तविक समयको नाफा रिपोर्ट।",
    googleVerified: "गुगल ओअथ २.० प्रमाणित • २५६-बिट एसएसएल सुरक्षित",

    // Language Toggle
    currentLanguageName: "नेपाली",
    switchLanguage: "View in English",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("gajurmukhi_language") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gajurmukhi_language", language);
      document.documentElement.lang = language;
    } catch (e) {
      console.error("Could not persist language choice:", e);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ne" : "en"));
  };

  /**
   * Helper translation function
   * @param {string} key - Dictionary key
   * @param {object} [params] - Replacement variables (e.g. { count: 5 })
   */
  const t = (key, params = {}) => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;

    // Substitute placeholders {paramName}
    if (params && typeof params === "object") {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), params[paramKey]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isNepali: language === "ne",
        isEnglish: language === "en",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
