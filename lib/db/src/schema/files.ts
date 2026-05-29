import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const filesTable = pgTable("files", {
  blobId: text("blob_id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  fileName: text("file_name").notNull(),
  size: integer("size").notNull(),
  sha256Hash: text("sha256_hash"),
  source: text("source").notNull().default("local"),
  walrusBlobId: text("walrus_blob_id"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFileSchema = createInsertSchema(filesTable).omit({ uploadedAt: true });
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof filesTable.$inferSelect;
