require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const prisma = require("./lib/prisma");
const { authenticateUser } = require("./middleware/auth");
const { validate } = require("./middleware/validate");
const {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  updateAfterBillSchema,
  addSalesSchema,
} = require("./schemas/inventorySchemas");

const app = express();

// Security Headers (configured to allow local cross-origin frontend requests)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use(limiter);

// CORS configuration
const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  "https://127.0.0.1:3000,https://localhost:3000,http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Request logger for development insight
app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.originalUrl}`);
  next();
});

process.on("uncaughtException", function (err) {
  console.error("Uncaught exception:", err);
});

// Helper for current date
function getDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  return `${year}-${month}-${date}`;
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  return res.json("Inventory Management API - Running");
});

// Current user profile
app.get("/me", authenticateUser, (req, res) => {
  return res.json(req.user);
});

// Get products list for authenticated user
app.get(["/products", "/products/:user_id"], authenticateUser, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "desc" },
    });

    // Return with keys expected by frontend: ID, Name, Price, Quantity
    const formatted = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      Price: p.price,
      Quantity: p.quantity,
    }));

    console.log(
      `[Products] Returned ${formatted.length} products for user ${req.user.email} (user_id: ${req.user.id})`
    );
    return res.json(formatted);
  } catch (err) {
    console.error(`Error querying products for user ${req.user.id}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// Get sales list for authenticated user
app.get(["/sales", "/sales/:user_id"], authenticateUser, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "desc" },
    });

    // Return with keys expected by frontend: SalesID, SName, SPrice, SQuantity, DOS, Stotal
    const formatted = sales.map((s) => ({
      SalesID: s.id,
      SName: s.productName,
      SPrice: s.price,
      SQuantity: s.quantity,
      DOS: s.dateOfSale,
      Stotal: s.total,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("Error querying sales:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Read single product by ID (ensuring ownership)
app.get("/read/:ID", authenticateUser, validate(idParamSchema), async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.ID,
        userId: req.user.id,
      },
    });

    if (!product) {
      return res.json([]);
    }

    return res.json([
      {
        ID: product.id,
        Name: product.name,
        Price: product.price,
        Quantity: product.quantity,
      },
    ]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Add new product for authenticated user (with schema validation)
app.post(
  "/addproducts",
  authenticateUser,
  validate(createProductSchema),
  async (req, res) => {
    try {
      const { Name, Price, Quantity } = req.body;
      const product = await prisma.product.create({
        data: {
          name: Name,
          price: Price,
          quantity: Quantity,
          userId: req.user.id,
        },
      });

      return res.json({ insertId: product.id, affectedRows: 1 });
    } catch (err) {
      console.error("Error adding product:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// Update product (ensuring ownership and validation)
app.put(
  "/update/:ID",
  authenticateUser,
  validate(updateProductSchema),
  async (req, res) => {
    try {
      const { ID } = req.params;
      const { Name, Price, Quantity } = req.body;

      const updateResult = await prisma.product.updateMany({
        where: {
          id: ID,
          userId: req.user.id,
        },
        data: {
          name: Name,
          price: Price,
          quantity: Quantity,
        },
      });

      return res.json({ affectedRows: updateResult.count });
    } catch (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// Update products quantity after billing (atomic transaction with validation)
app.put(
  "/updateAfterBill",
  authenticateUser,
  validate(updateAfterBillSchema),
  async (req, res) => {
    try {
      const products = req.body; // Array of { Name, Quantity }

      await prisma.$transaction(
        products.map((item) =>
          prisma.product.updateMany({
            where: {
              name: item.Name,
              userId: req.user.id,
            },
            data: {
              quantity: {
                decrement: item.Quantity,
              },
            },
          })
        )
      );

      return res.json({
        message: "Product quantities updated successfully after bill generation",
        affectedRows: products.length,
      });
    } catch (err) {
      console.error("Error updating stock after bill:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// Delete product (ensuring ownership and validation)
app.delete(
  "/delete/:ID",
  authenticateUser,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const { ID } = req.params;
      const deleteResult = await prisma.product.deleteMany({
        where: {
          id: ID,
          userId: req.user.id,
        },
      });

      return res.json({ affectedRows: deleteResult.count });
    } catch (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// Add sales records for authenticated user (with validation)
app.post(
  ["/addSales", "/addSales/:ID"],
  authenticateUser,
  validate(addSalesSchema),
  async (req, res) => {
    try {
      const salesData = req.body;
      const currentDate = getDate();

      await prisma.sale.createMany({
        data: salesData.map((sale) => ({
          productName: sale.Name,
          price: sale.Price,
          quantity: sale.Quantity,
          total: sale.Total,
          dateOfSale: currentDate,
          userId: req.user.id,
        })),
      });

      return res.json({
        message: "Sales records inserted successfully",
        affectedRows: salesData.length,
      });
    } catch (err) {
      console.error("Error recording sales:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// Backwards-compatible getusers endpoint
app.post("/getusers", async (req, res) => {
  try {
    const { Email, Name } = req.body;
    if (!Email) {
      return res.json([]);
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: Email.trim().toLowerCase() }, { email: Email }],
      },
    });

    if (!user) {
      const userName = Name || Email.split("@")[0];
      user = await prisma.user.create({
        data: {
          name: userName,
          email: Email,
        },
      });
    }

    return res.json([{ ID: user.id }]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Start Server
if (require.main === module) {
  const http = require("http");
  const https = require("https");
  const fs = require("fs");
  const path = require("path");

  const HTTP_PORT = process.env.PORT || 8081;
  const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

  // 1. HTTP listener (for local tools / proxy)
  const httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, () => {
    console.log(`Secured backend (HTTP) listening on http://127.0.0.1:${HTTP_PORT}`);
  });

  // 2. HTTPS listener using dev cert generated by webpack-dev-server
  const certPath = path.resolve(
    __dirname,
    "../frontend/node_modules/.cache/webpack-dev-server/server.pem"
  );
  if (fs.existsSync(certPath)) {
    try {
      const certData = fs.readFileSync(certPath);
      const httpsServer = https.createServer({ key: certData, cert: certData }, app);
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`Secured backend (HTTPS) listening on https://127.0.0.1:${HTTPS_PORT}`);
      });
    } catch (sslErr) {
      console.warn("Could not start HTTPS listener:", sslErr.message);
    }
  } else {
    console.warn(`[SSL Warning] Dev cert not found at ${certPath}`);
  }
}

module.exports = app;
