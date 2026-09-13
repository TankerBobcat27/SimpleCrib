import { boolean, date, index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantSlug: text("tenant_slug").notNull(),
    role: text("role").notNull().default("operator"),
  },
  (table) => [index("user_tenant_idx").on(table.tenantId)],
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const gages = pgTable(
  "gages",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    shopId: text("shop_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    manufacturer: text("manufacturer"),
    serial: text("serial"),
    location: text("location").notNull().default("Quality Lab"),
    lastCal: date("last_cal"),
    nextDue: date("next_due"),
    status: text("status").notNull().default("available"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("gages_tenant_shop_id").on(table.tenantId, table.shopId),
    index("gages_tenant_due_idx").on(table.tenantId, table.nextDue),
    index("gages_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export const calHistory = pgTable(
  "cal_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    gageId: text("gage_id")
      .notNull()
      .references(() => gages.id, { onDelete: "cascade" }),
    calibratedAt: date("calibrated_at").notNull(),
    nextDue: date("next_due"),
    result: text("result").notNull().default("pass"),
    notes: text("notes"),
    performedBy: text("performed_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("cal_history_tenant_gage_idx").on(table.tenantId, table.gageId)],
);

export const tools = pgTable(
  "tools",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    toolNumber: text("tool_number").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    manufacturer: text("manufacturer"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("tools_tenant_number").on(table.tenantId, table.toolNumber),
    index("tools_tenant_type_idx").on(table.tenantId, table.type),
  ],
);

export const toolLocations = pgTable(
  "tool_locations",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    location: text("location").notNull(),
    quantity: integer("quantity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("tool_locations_tenant_tool_loc").on(table.tenantId, table.toolId, table.location),
    index("tool_locations_tenant_tool_idx").on(table.tenantId, table.toolId),
    index("tool_locations_tenant_loc_idx").on(table.tenantId, table.location),
  ],
);

export const toolMoves = pgTable(
  "tool_moves",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    intent: text("intent").notNull(),
    fromLocation: text("from_location").notNull(),
    toLocation: text("to_location").notNull(),
    quantity: integer("quantity").notNull(),
    performedBy: text("performed_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("tool_moves_tenant_tool_idx").on(table.tenantId, table.toolId)],
);

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof user.$inferSelect;
export type Gage = typeof gages.$inferSelect;
export type CalHistory = typeof calHistory.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type ToolLocation = typeof toolLocations.$inferSelect;
export type ToolMove = typeof toolMoves.$inferSelect;
