import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadVideo = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get file metadata
    const fileMetadata = await ctx.db.system.get(args.storageId);
    if (!fileMetadata) {
      throw new Error("File not found");
    }

    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      storageId: args.storageId,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      fileSize: fileMetadata.size,
      contentType: fileMetadata.contentType,
    });

    return videoId;
  },
});

export const listVideos = query({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_uploaded_at")
      .order("desc")
      .collect();

    return Promise.all(
      videos.map(async (video) => {
        const url = await ctx.storage.getUrl(video.storageId);
        const uploader = await ctx.db.get(video.uploadedBy);
        return {
          ...video,
          url,
          uploaderName: uploader?.name || uploader?.email || "Unknown",
        };
      })
    );
  },
});

export const getVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      return null;
    }

    const url = await ctx.storage.getUrl(video.storageId);
    const uploader = await ctx.db.get(video.uploadedBy);

    return {
      ...video,
      url,
      uploaderName: uploader?.name || uploader?.email || "Unknown",
    };
  },
});

export const deleteVideo = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    if (video.uploadedBy !== userId) {
      throw new Error("Not authorized to delete this video");
    }

    await ctx.db.delete(args.videoId);
    return { success: true };
  },
});
