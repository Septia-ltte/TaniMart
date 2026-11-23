import { pgTable, pgEnum, serial, varchar, text, integer, decimal, timestamp, date } from "drizzle-orm/pg-core";

export const productTypeEnum = pgEnum("product_type", [
    "regular",
    "package",
    "surprise_bag",
    "pre_order",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "inactive",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "ready_for_pickup",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
  "refunded",
]);

// ROLE
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// USERS
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: varchar("password", {length: 255}).notNull(),
  roleId: integer("role_id") .references(() => roles.id) .notNull().default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CATEGORIES
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CARTS
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CART ITEMS
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .references(() => carts.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PRODUCTS
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").references(() => usersTable.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id, {onDelete: "cascade"}).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  type: productTypeEnum("type").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  unit: varchar("unit", { length: 30 }),
  harvestDate: date("harvest_date", {mode: "date",}),
  preOrder: date("pre_order", {mode: "date",}),
  status: productStatusEnum("status").default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PACKAGE ITEMS
export const packageItems = pgTable("package_items", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").references(() => products.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
});

// ORDERS
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  orderCode: varchar("order_code", { length: 50 }).notNull().unique(),
  totalPrice: decimal("total_price", {precision: 12,scale: 2,}).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  status: orderStatusEnum("status").default("pending"),
  orderDate: timestamp("order_date").defaultNow(),
});

// ORDER ITEMS
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// PAYMENTS
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  amount: decimal("amount", {
    precision: 12,
    scale: 2,
  }).notNull(),
  status: paymentStatusEnum("status")
    .default("pending")
    .notNull(),
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});