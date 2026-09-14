const { authenticateUser } = require("./middleware/auth");

async function testAuthHardening() {
  console.log("=== Testing Authentication Security Hardening ===");

  // Test 1: Production Mode (NODE_ENV=production)
  process.env.NODE_ENV = "production";
  console.log("\n[Test 1] Testing Production Mode with x-user-email spoofing attempt...");

  let prodSpoofStatus = null;
  let prodSpoofError = null;

  const fakeReqProd = {
    headers: {
      "x-user-email": "admin@example.com", // spoof attempt without Bearer token
    },
  };
  const fakeResProd = {
    status: (code) => {
      prodSpoofStatus = code;
      return {
        json: (data) => {
          prodSpoofError = data.error;
        },
      };
    },
  };

  let nextCalledProd = false;
  authenticateUser(fakeReqProd, fakeResProd, () => {
    nextCalledProd = true;
  });

  if (nextCalledProd || prodSpoofStatus !== 401) {
    throw new Error(
      `Security vulnerability: Production allowed unauthenticated request with x-user-email! Status: ${prodSpoofStatus}`
    );
  }
  console.log(`✔ Production strictly rejected header spoofing with HTTP ${prodSpoofStatus}: "${prodSpoofError}"`);

  // Test 2: Development Mode fallback
  process.env.NODE_ENV = "development";
  console.log("\n[Test 2] Testing Development Mode fallback for developer convenience...");

  let nextCalledDev = false;

  const fakeReqDev = {
    headers: {
      "x-user-email": "khadkajosan@gmail.com",
    },
  };
  const fakeResDev = {
    status: (code) => {
      return { json: () => {} };
    },
  };

  await new Promise((resolve) => {
    authenticateUser(fakeReqDev, fakeResDev, () => {
      nextCalledDev = true;
      resolve();
    });
    setTimeout(resolve, 500);
  });

  if (!nextCalledDev || !fakeReqDev.user) {
    throw new Error("Dev fallback failed to authenticate local user!");
  }
  console.log(`✔ Dev mode accepted local test user: ${fakeReqDev.user.email} (ID: ${fakeReqDev.user.id})`);

  console.log("\n================================================");
  console.log("🎉 AUTH SECURITY HARDENING VERIFIED SUCCESSFULLY!");
  console.log("================================================");
  process.exit(0);
}

testAuthHardening().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
