import mongoose from "mongoose";

// Cache the connection across serverless invocations so each request reuses
// one pool instead of opening a new connection every cold/warm start.
let cached: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  if (!cached) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    // Fail fast (8s) instead of hanging until the function times out.
    cached = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 }).catch((err) => {
      cached = null; // let the next request retry instead of caching the failure
      throw err;
    });
  }
  return cached;
}
