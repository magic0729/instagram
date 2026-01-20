import mongoose, { type InferSchemaType } from "mongoose";

const instagramAccountSchema = new mongoose.Schema(
  {
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    igUserId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    profilePictureUrl: { type: String },
    accountType: { type: String },

    followersCount: { type: Number, default: 0 },
    mediaCount: { type: Number, default: 0 },

    isListed: { type: Boolean, default: true, index: true },

    // Meta user access token (long-lived). In production consider encrypting at rest.
    accessToken: { type: String, required: true, select: false },
    tokenExpiresAt: { type: Date, required: true },

    // Optional: useful for troubleshooting / audits
    metaUserId: { type: String },
    pageId: { type: String },
  },
  { timestamps: true }
);

export type InstagramAccountDoc = InferSchemaType<typeof instagramAccountSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InstagramAccount =
  (mongoose.models.InstagramAccount as mongoose.Model<InstagramAccountDoc>) ||
  mongoose.model<InstagramAccountDoc>("InstagramAccount", instagramAccountSchema);
