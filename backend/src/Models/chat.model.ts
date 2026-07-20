import mongoose, { Document, Model, Types } from "mongoose";

export type ChatRole = "user" | "assistant";

export interface IMessage {
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface IChat extends Document {
  userId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema<IChat>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New Chat" },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);
