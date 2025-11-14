import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  videos: defineTable({
    title: v.string(),
    description: v.string(),
    storageId: v.id("_storage"),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    duration: v.optional(v.number()),
    fileSize: v.optional(v.number()),
    contentType: v.optional(v.string()),
  }).index("by_uploaded_at", ["uploadedAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
