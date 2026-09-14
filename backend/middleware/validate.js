const { z } = require("zod");

/**
 * Express middleware to validate request against a Zod schema.
 * @param {object} schemas - Object containing optional body, params, and query Zod schemas.
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({
          error: "Validation error",
          details: issues,
        });
      }
      return res.status(400).json({ error: "Invalid request data" });
    }
  };
};

module.exports = { validate };
