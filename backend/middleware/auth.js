const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");
const prisma = require("../lib/prisma");

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  "348149978736-l06qd35ip5rcvlehi8jgeqmjtvk3ug9j.apps.googleusercontent.com";

// Google OAuth 2.0 public certs JWKS endpoint
const googleJwksClient = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 20,
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
});

function getKey(header, callback) {
  if (!header || !header.kid) {
    return callback(new Error("Token header missing 'kid' (key ID)"));
  }
  googleJwksClient.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey ? key.getPublicKey() : key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// In-memory cache for verified tokens to eliminate slow repeated JWKS network calls
const verifiedTokenCache = new Map();
// In-memory cache for user database records (5-minute TTL)
const userCache = new Map();

function getCachedTokenPayload(token) {
  const cached = verifiedTokenCache.get(token);
  if (!cached) return null;
  if (cached.exp && cached.exp * 1000 <= Date.now()) {
    verifiedTokenCache.delete(token);
    return null;
  }
  return cached;
}

function setCachedTokenPayload(token, payload) {
  if (!token || !payload) return;
  if (verifiedTokenCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of verifiedTokenCache.entries()) {
      if (v.exp && v.exp * 1000 <= now) verifiedTokenCache.delete(k);
    }
  }
  verifiedTokenCache.set(token, payload);
}

function handleVerifiedPayload(verifiedPayload, req, res, next, isProd, headerEmail) {
  let email = verifiedPayload.email;

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
    (email && email.includes("@") ? email.split("@")[0] : "Google User");

  const sub = verifiedPayload.sub;

  lookupAndAttachUser(email, name, sub, req, res, next);
}

// Middleware to verify Google OAuth ID token and attach user
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

  // FAST PATH: If this token was already verified recently, resolve in 0.01ms!
  const cachedPayload = getCachedTokenPayload(token);
  if (cachedPayload) {
    return handleVerifiedPayload(cachedPayload, req, res, next, isProd, headerEmail);
  }

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
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: googleClientId,
    algorithms: ["RS256"],
  };

  jwt.verify(token, getKey, verifyOptions, (err, payload) => {
    let verifiedPayload = payload;

    if (err) {
      console.warn("[Auth Warning] Google RS256 token verification failed:", err.message);

      if (isProd) {
        // STRICT IN PRODUCTION: reject immediately, no fallback
        return res.status(401).json({ error: "Unauthorized: Invalid or expired Google token." });
      }

      // DEVELOPMENT ONLY FALLBACK:
      console.warn("[DEV AUTH WARN] Verification failed, checking dev fallbacks...");
      const unverified = decodedToken.payload;
      if (
        unverified &&
        (unverified.iss?.includes("google") || unverified.email)
      ) {
        console.warn(
          "[DEV AUTH WARN] Accepting unverified local token for development session"
        );
        verifiedPayload = unverified;
      } else if (headerEmail) {
        console.warn(`[DEV AUTH WARN] Using x-user-email fallback: ${headerEmail}`);
        return lookupAndAttachUser(headerEmail, headerEmail.split("@")[0], null, req, res, next);
      } else {
        return res.status(401).json({ error: "Unauthorized: " + err.message });
      }
    }

    // Cache verified payload for subsequent requests
    setCachedTokenPayload(token, verifiedPayload);

    handleVerifiedPayload(verifiedPayload, req, res, next, isProd, headerEmail);
  });
};

// Helper to look up or register user in Prisma with email alias support
async function lookupAndAttachUser(email, name, sub, req, res, next) {
  if (!email) {
    return res.status(401).json({ error: "Unauthorized: User email required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const cachedUser = userCache.get(normalizedEmail);
  if (cachedUser && cachedUser._cachedAt > Date.now() - 5 * 60 * 1000) {
    req.user = {
      id: cachedUser.id,
      email: cachedUser.email,
      name: cachedUser.name,
      sub: sub,
    };
    return next();
  }

  try {
    // Try matching by exact or case-insensitive email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { email: email }],
      },
    });

    if (user) {
      userCache.set(normalizedEmail, {
        id: user.id,
        email: user.email,
        name: user.name,
        _cachedAt: Date.now(),
      });
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

