import mongoose from "mongoose";
import { getEnv } from "@/lib/env";

type GlobalWithMongoose = typeof globalThis & {
  _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const globalWithMongoose = global as GlobalWithMongoose;

export async function connectToDatabase() {
  const env = getEnv();
  if (!globalWithMongoose._mongoose) {
    globalWithMongoose._mongoose = { conn: null, promise: null };
  }

  if (globalWithMongoose._mongoose.conn) return globalWithMongoose._mongoose.conn;

  if (!globalWithMongoose._mongoose.promise) {
    globalWithMongoose._mongoose.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  globalWithMongoose._mongoose.conn = await globalWithMongoose._mongoose.promise;
  return globalWithMongoose._mongoose.conn;
}
