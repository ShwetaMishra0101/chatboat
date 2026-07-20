import type { Request, Response } from "express";
import { Chat } from "../Models/chat.model";
import { generateReply, generateTitle, type AiMessage } from "../Services/ai.service";

// The `protect` middleware attaches the authenticated user to the request.
function userId(req: Request): string {
  return (req as { user?: { _id: string } }).user!._id;
}

// GET /api/chat — list the user's chats for the sidebar (no messages).
export const listChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ userId: userId(req) })
      .sort({ updatedAt: -1 })
      .select("title updatedAt");
    res.json(chats);
  } catch (error) {
    console.error("listChats error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
};

// GET /api/chat/search?q= — search a user's chats by title or message content.
export const searchChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (!q) {
      res.json([]);
      return;
    }
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const chats = await Chat.find({
      userId: userId(req),
      $or: [{ title: rx }, { "messages.content": rx }],
    })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select("title updatedAt");
    res.json(chats);
  } catch (error) {
    console.error("searchChats error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

// POST /api/chat — create a new, empty chat.
export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const chat = await Chat.create({ userId: userId(req), title: "New Chat", messages: [] });
    res.status(201).json(chat);
  } catch (error) {
    console.error("createChat error:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// GET /api/chat/:id — fetch a full chat with its messages.
export const getChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: userId(req) });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.json(chat);
  } catch (error) {
    console.error("getChat error:", error);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

// POST /api/chat/:id/messages — send a message and get the AI reply.
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const content = (req.body?.content as string || "").trim();
    if (!content) {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    const chat = await Chat.findOne({ _id: req.params.id, userId: userId(req) });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const isFirstMessage = chat.messages.length === 0;
    chat.messages.push({ role: "user", content, createdAt: new Date() });

    // Pass the full history so the reply is aware of the whole conversation.
    const history: AiMessage[] = chat.messages.map((m) => ({ role: m.role, content: m.content }));
    const reply = await generateReply(history);
    chat.messages.push({ role: "assistant", content: reply, createdAt: new Date() });

    // Auto-generate a title from the first user message (like ChatGPT).
    if (isFirstMessage) {
      chat.title = await generateTitle(content);
    }

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// PATCH /api/chat/:id — rename a chat.
export const renameChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const title = (req.body?.title as string || "").trim();
    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: userId(req) },
      { title },
      { new: true }
    );
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.json(chat);
  } catch (error) {
    console.error("renameChat error:", error);
    res.status(500).json({ message: "Failed to rename chat" });
  }
};

// DELETE /api/chat/:id — delete a chat.
export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: userId(req) });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error("deleteChat error:", error);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};
