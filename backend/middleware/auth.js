const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");
const prisma = require("../lib/prisma");

const domain = process.env.AUTH0_DOMAIN || "dev-cuxo3uboupppygbb.us.auth0.com";
const clientId = process.env.AUTH0_CLIENT_ID || "3MjnrJPwYiky6ylFURKr4Ahj45XHtTOl";
const audience = process.env.AUTH0_AUDIENCE;

const jwksClient = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: `https://${domain}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  if (!header || !header.kid) {
    return callback(new Error("Token header missing 'kid' (key ID)"));
  }
  jwksClient.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey ? key.getPublicKey() : key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware to verify Auth0 JWT and attach user
const authenticateUser = (req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  const authHeader = req.headers.authorization;
  const headerEmail = req.headers["x-user-email"];

  // In production: strict Bearer token requirement (disallow header bypass)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (!isProd && headerEmail) {
      console.warn(
        `[DEV AUTH WARN] Bypassing Bearer token check via x-user-email header: ${headerEmail}`
      );
      return lookupAndAttachUser(headerEmail, headerEmail.split("@")[0], null, req, res, next);
    }
    return res.status(401).json({ error: "Access denied. Bearer authorization token required." });
  }

  const token = authHeader.split(" ")[1];

  // Decode unverified token to inspect claims and header
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken || !decodedToken.header) {
    if (!isProd && headerEmail) {
      console.warn(
        `[DEV AUTH WARN] Invalid token format; falling back to x-user-email: ${headerEmail}`
      );
      return lookupAndAttachUser(headerEmail, headerEmail.split("@")[0], null, req, res, next);
    }
    return res.status(401).json({ error: "Invalid token format." });
  }

  const verifyOptions = {
    issuer: [`https://${domain}/`, `https://${domain}`],
    algorithms: ["RS256"],
  };

  // If audience or clientId is configured, validate audience
  if (audience) {
    verifyOptions.audience = [audience, clientId];
  }

  jwt.verify(token, getKey, verifyOptions, (err, payload) => {
    let verifiedPayload = payload;

    if (err) {
      console.warn("[Auth Warning] RS256 token verification failed:", err.message);

      if (isProd) {
        // STRICT IN PRODUCTION: reject immediately, no fallback
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
      }

      // DEVELOPMENT ONLY FALLBACK:
      console.warn("[DEV AUTH WARN] Verification failed, checking dev fallbacks...");
      const unverified = decodedToken.payload;
      if (
        unverified &&
        (unverified.iss === `https://${domain}/` || unverified.iss === `https://${domain}`)
      ) {
        console.warn(
          "[DEV AUTH WARN] Accepting unverified local Auth0 token for development session"
        );
        verifiedPayload = unverified;
      } else if (headerEmail) {
        console.warn(`[DEV AUTH WARN] Using x-user-email fallback: ${headerEmail}`);
        return lookupAndAttachUser(headerEmail, headerEmail.split("@")[0], null, req, res, next);
      } else {
        return res.status(401).json({ error: "Unauthorized: " + err.message });
      }
    }

    // In production, email MUST come from verified token claims
    let email =
      verifiedPayload.email ||
      verifiedPayload[`https://${domain}/email`];

    if (!email && !isProd) {
      email = headerEmail || verifiedPayload.sub;
    }

    if (!email) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No verified email claim found in token." });
    }

    const name =
      verifiedPayload.name ||
      verifiedPayload.nickname ||
      verifiedPayload[`https://${domain}/name`] ||
      (email && email.includes("@") ? email.split("@")[0] : "User");

    const sub = verifiedPayload.sub;

    lookupAndAttachUser(email, name, sub, req, res, next);
  });
};

// Helper to look up or register user in Prisma with email alias support
async function lookupAndAttachUser(email, name, sub, req, res, next) {
  if (!email) {
    return res.status(401).json({ error: "Unauthorized: User email required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Try matching by exact or case-insensitive email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { email: email }],
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        sub: sub,
      };
      console.log(`[Auth] Authenticated user ${req.user.email} (ID: ${req.user.id})`);
      return next();
    }

    // Check alias for khadkajosan@gmail.com vs khadkajoshan@gmail.com
    let altEmail = null;
    if (normalizedEmail === "khadkajosan@gmail.com") {
      altEmail = "khadkajoshan@gmail.com";
    } else if (normalizedEmail === "khadkajoshan@gmail.com") {
      altEmail = "khadkajosan@gmail.com";
    }

    if (altEmail) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: altEmail }, { email: altEmail.toLowerCase() }],
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          sub: sub,
        };
        console.log(
          `[Auth Alias] Matched user ${altEmail} -> ${req.user.email} (ID: ${req.user.id})`
        );
        return next();
      }
    }

    // Create user record if not exists
    user = await prisma.user.create({
      data: {
        name: name,
        email: email,
      },
    });

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      sub: sub,
    };
    console.log(`[Auth] Created new user record for ${email} (ID: ${req.user.id})`);
    return next();
  } catch (error) {
    console.error("Database auth error:", error);
    return res.status(500).json({ error: "Database error during authentication." });
  }
}

module.exports = { authenticateUser };

