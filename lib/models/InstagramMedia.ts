import mongoose, { type InferSchemaType } from "mongoose";

const instagramMediaSchema = new mongoose.Schema(
  {
    instagramAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },
    igMediaId: { type: String, required: true, unique: true, index: true },

    caption: { type: String },
    mediaType: { type: String, required: true },
    mediaUrl: { type: String },
    thumbnailUrl: { type: String },
    permalink: { type: String },
    timestamp: { type: Date, required: true, index: true },

    likeCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    insights: {
      reach: { type: Number },
      impressions: { type: Number },
      engagement: { type: Number },
      saved: { type: Number },
      videoViews: { type: Number },
    },
  },
  { timestamps: true }
);

instagramMediaSchema.index({ instagramAccountId: 1, timestamp: -1 });

export type InstagramMediaDoc = InferSchemaType<typeof instagramMediaSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InstagramMedia =
  (mongoose.models.InstagramMedia as mongoose.Model<InstagramMediaDoc>) ||
  mongoose.model<InstagramMediaDoc>("InstagramMedia", instagramMediaSchema);

