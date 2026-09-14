const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    [
      "/products",
      "/sales",
      "/addproducts",
      "/addSales",
      "/update",
      "/delete",
      "/updateAfterBill",
      "/me",
      "/health",
      "/read",
      "/getusers",
    ],
    createProxyMiddleware({
      target: "http://127.0.0.1:8081",
      changeOrigin: true,
      secure: false,
    })
  );
};
