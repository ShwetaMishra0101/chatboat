import { Router } from "express";
import { protect } from "../Middlewares/auth.middleware";
import {
  listChats,
  searchChats,
  createChat,
  getChat,
  sendMessage,
  renameChat,
  deleteChat,
} from "../Controllers/chat.controller";

const router = Router();

// All chat routes require authentication.
router.use(protect);

router.get("/", listChats);
router.post("/", createChat);
router.get("/search", searchChats); // must be before "/:id"
router.get("/:id", getChat);
router.post("/:id/messages", sendMessage);
router.patch("/:id", renameChat);
router.delete("/:id", deleteChat);

export default router;
