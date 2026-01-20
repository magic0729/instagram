import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["creator", "brand"], required: true, index: true },

    // Brand auth
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },

    // Creator auth
    instagramAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "InstagramAccount" },
    creatorMetaUserId: { type: String },
    creatorOnboarding: {
      status: {
        type: String,
        enum: ["connected", "needs_page_connection", "unknown"],
        default: "unknown",
      },
      lastError: { type: String },
      lastCheckedAt: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "brand", email: { $type: "string" } },
  }
);

userSchema.index(
  { creatorMetaUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "creator", creatorMetaUserId: { $type: "string" } },
  }
);

export type UserRole = "creator" | "brand";
export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User =
  (mongoose.models.User as mongoose.Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema);
