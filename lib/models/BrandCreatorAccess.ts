import mongoose, { type InferSchemaType } from "mongoose";

const brandCreatorAccessSchema = new mongoose.Schema(
  {
    brandUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "revoked"], default: "pending" },
  },
  { timestamps: true }
);

brandCreatorAccessSchema.index({ brandUserId: 1, creatorUserId: 1 }, { unique: true });

export type BrandCreatorAccessDoc = InferSchemaType<typeof brandCreatorAccessSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BrandCreatorAccess =
  (mongoose.models.BrandCreatorAccess as mongoose.Model<BrandCreatorAccessDoc>) ||
  mongoose.model<BrandCreatorAccessDoc>("BrandCreatorAccess", brandCreatorAccessSchema);

