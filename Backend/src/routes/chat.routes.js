const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { authenticate } = require("../middleware/auth.middleware");

// All chat routes require authentication
router.use(authenticate);

router.post("/conversation", chatController.getOrCreateConversation);
router.post("/message", chatController.sendMessage);
router.get("/conversations", chatController.getConversations);
router.get("/messages/:conversationId", chatController.getMessages);
router.get("/unread-count", chatController.getUnreadCount);

module.exports = router;
