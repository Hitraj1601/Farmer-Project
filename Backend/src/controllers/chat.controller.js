const chatService = require("../services/chat.service");
const { sendResponse } = require("../utils/apiResponse");

const getOrCreateConversation = async (req, res, next) => {
  try {
    const { farmerId, cropId } = req.body;

    if (!farmerId) {
      return sendResponse(res, 400, "farmerId is required.");
    }

    const conversation = await chatService.getOrCreateConversation(
      req.user.id,
      farmerId,
      cropId || null
    );

    return sendResponse(res, 200, "Conversation ready.", conversation);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content?.trim()) {
      return sendResponse(res, 400, "conversationId and content are required.");
    }

    const message = await chatService.sendMessage(
      conversationId,
      req.user.id,
      content.trim()
    );

    return sendResponse(res, 201, "Message sent.", message);
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversations(req.user.id);
    return sendResponse(res, 200, "Conversations fetched.", conversations);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(
      req.params.conversationId,
      req.user.id
    );
    return sendResponse(res, 200, "Messages fetched.", messages);
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await chatService.getUnreadCount(req.user.id);
    return sendResponse(res, 200, "Unread count fetched.", { count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
};
