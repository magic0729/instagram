import mongoose, { type InferSchemaType } from "mongoose";

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    instagramAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD

    followersCount: { type: Number, default: 0 },
    mediaCount: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ instagramAccountId: 1, date: 1 }, { unique: true });

export type AnalyticsSnapshotDoc = InferSchemaType<typeof analyticsSnapshotSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AnalyticsSnapshot =
  (mongoose.models.AnalyticsSnapshot as mongoose.Model<AnalyticsSnapshotDoc>) ||
  mongoose.model<AnalyticsSnapshotDoc>("AnalyticsSnapshot", analyticsSnapshotSchema);

