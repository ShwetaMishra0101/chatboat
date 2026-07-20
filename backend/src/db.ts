import mongoose from "mongoose";

// Cache the connection across serverless invocations so each request reuses
// one pool instead of opening a new connection every cold/warm start.
let cached: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  if (!cached) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    cached = mongoose.connect(uri);
  }
  return cached;
}
