import mongoose, { type InferSchemaType } from "mongoose";

const creatorMetaTokenSchema = new mongoose.Schema(
  {
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    accessToken: { type: String, required: true, select: false },
    tokenExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export type CreatorMetaTokenDoc = InferSchemaType<typeof creatorMetaTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CreatorMetaToken =
  (mongoose.models.CreatorMetaToken as mongoose.Model<CreatorMetaTokenDoc>) ||
  mongoose.model<CreatorMetaTokenDoc>("CreatorMetaToken", creatorMetaTokenSchema);

