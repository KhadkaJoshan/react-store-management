const { z } = require("zod");

// Product Schemas
const createProductSchema = {
  body: z.object({
    Name: z
      .string({ required_error: "Product name is required" })
      .trim()
      .min(1, "Product name cannot be empty")
      .max(100, "Product name must be 100 characters or fewer"),
    Price: z.coerce
      .number({ invalid_type_error: "Price must be a number" })
      .min(0, "Price cannot be negative"),
    Quantity: z.coerce
      .number({ invalid_type_error: "Quantity must be an integer" })
      .int("Quantity must be a whole number"),
  }),
};

const updateProductSchema = {
  params: z.object({
    ID: z.coerce
      .number({ invalid_type_error: "Product ID must be a number" })
      .int("Product ID must be an integer")
      .positive("Product ID must be positive"),
  }),
  body: z.object({
    Name: z
      .string({ required_error: "Product name is required" })
      .trim()
      .min(1, "Product name cannot be empty")
      .max(100, "Product name must be 100 characters or fewer"),
    Price: z.coerce
      .number({ invalid_type_error: "Price must be a number" })
      .min(0, "Price cannot be negative"),
    Quantity: z.coerce
      .number({ invalid_type_error: "Quantity must be an integer" })
      .int("Quantity must be a whole number"),
  }),
};

const idParamSchema = {
  params: z.object({
    ID: z.coerce
      .number({ invalid_type_error: "ID must be a number" })
      .int("ID must be an integer")
      .positive("ID must be positive"),
  }),
};

// Billing Schemas
const updateAfterBillSchema = {
  body: z
    .array(
      z.object({
        Name: z
          .string({ required_error: "Product name is required" })
          .trim()
          .min(1, "Product name cannot be empty"),
        Quantity: z.coerce
          .number({ invalid_type_error: "Quantity must be a number" })
          .int("Quantity must be a whole number"),
      })
    )
    .min(1, "At least one product item is required for bill update"),
};

const addSalesSchema = {
  body: z
    .array(
      z.object({
        Name: z
          .string({ required_error: "Product name is required" })
          .trim()
          .min(1, "Product name cannot be empty"),
        Price: z.coerce
          .number({ invalid_type_error: "Price must be a number" })
          .min(0, "Price cannot be negative"),
        Quantity: z.coerce
          .number({ invalid_type_error: "Quantity must be a number" })
          .int("Quantity must be a whole number"),
        Total: z.coerce
          .number({ invalid_type_error: "Total must be a number" })
          .min(0, "Total cannot be negative"),
      })
    )
    .min(1, "At least one sale record is required"),
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  updateAfterBillSchema,
  addSalesSchema,
};
