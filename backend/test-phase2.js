const prisma = require("./lib/prisma");
const { authenticateUser } = require("./middleware/auth");
const { validate } = require("./middleware/validate");
const {
  createProductSchema,
  updateProductSchema,
  updateAfterBillSchema,
} = require("./schemas/inventorySchemas");

async function runTests() {
  console.log("=== Running Phase 2 Verification Suite ===");

  // 1. Verify Prisma Connection & User Inventory
  console.log("\n[Test 1] Verifying database connectivity and user inventory...");
  const users = await prisma.user.findMany({
    include: { products: true, sales: true },
  });
  console.log(`Found ${users.length} user(s).`);
  const user = users.find((u) => u.email === "khadkajosan@gmail.com");
  if (!user) {
    throw new Error("Target user khadkajosan@gmail.com not found!");
  }
  console.log(
    `User ${user.email} (ID: ${user.id}) currently has ${user.products.length} product(s) and ${user.sales.length} sale(s).`
  );
  console.log(
    "Current inventory items:",
    user.products.map((p) => `${p.name} ($${p.price}, qty: ${p.quantity})`).join(", ")
  );
  console.log("✔ User database relation and inventory successfully verified.");

  // 2. Test Zod Validation on Invalid Product
  console.log("\n[Test 2] Testing Zod validation on invalid payloads...");
  const invalidPayloads = [
    { body: { Name: "", Price: 10, Quantity: 5 } }, // empty name
    { body: { Name: "Bad Item", Price: -5, Quantity: 5 } }, // negative price
    { body: { Name: "Bad Item", Price: 10, Quantity: 2.5 } }, // non-integer quantity
  ];

  for (const payload of invalidPayloads) {
    let validationFailed = false;
    const req = { body: payload.body, params: {}, query: {} };
    const res = {
      status: (code) => ({
        json: (data) => {
          if (code === 400 && data.error === "Validation error") {
            validationFailed = true;
          }
        },
      }),
    };
    validate(createProductSchema)(req, res, () => {});
    if (!validationFailed) {
      throw new Error("Validation unexpectedly passed for: " + JSON.stringify(payload.body));
    }
  }
  console.log("✔ Zod correctly blocked all invalid payloads with 400 Validation Error.");

  // 3. Test Prisma Product Creation
  console.log("\n[Test 3] Creating new product with Prisma...");
  const testProduct = await prisma.product.create({
    data: {
      name: "Automated Test Item",
      price: 99.99,
      quantity: 50,
      userId: user.id,
    },
  });
  console.log("✔ Created test product ID: " + testProduct.id + ", Name: " + testProduct.name);

  // 4. Test Prisma Atomic Decrement (updateAfterBill)
  console.log("\n[Test 4] Testing atomic billing decrement transaction...");
  await prisma.$transaction([
    prisma.product.updateMany({
      where: { name: "Automated Test Item", userId: user.id },
      data: { quantity: { decrement: 10 } },
    }),
  ]);

  const afterBill = await prisma.product.findUnique({
    where: { id: testProduct.id },
  });
  if (afterBill.quantity !== 40) {
    throw new Error("Expected quantity to be 40 after decrement, got: " + afterBill.quantity);
  }
  console.log("✔ Stock atomically decremented from 50 to " + afterBill.quantity);

  // 5. Test Sales Recording
  console.log("\n[Test 5] Recording sale with Prisma...");
  const testSale = await prisma.sale.create({
    data: {
      productName: "Automated Test Item",
      price: 99.99,
      quantity: 10,
      total: 999.9,
      dateOfSale: "2026-9-13",
      userId: user.id,
    },
  });
  console.log("✔ Created sale record ID: " + testSale.id + " for $" + testSale.total);

  // 6. Clean up test records
  console.log("\n[Test 6] Cleaning up test records...");
  await prisma.product.delete({ where: { id: testProduct.id } });
  await prisma.sale.delete({ where: { id: testSale.id } });
  console.log("✔ Test records cleaned up successfully.");

  console.log("\n==========================================");
  console.log("🎉 ALL PHASE 2 VERIFICATION CHECKS PASSED!");
  console.log("==========================================");
}

runTests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
