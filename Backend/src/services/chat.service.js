const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { notifyUser, emitChatMessage } = require("../config/socket");

const getOrCreateConversation = async (buyerId, farmerId, cropId = null) => {
  // Validate that the farmer exists and is actually a farmer
  const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
  if (!farmer || farmer.role !== "FARMER") {
    throw new ApiError(404, "Farmer not found.");
  }

  if (buyerId === farmerId) {
    throw new ApiError(400, "You cannot start a conversation with yourself.");
  }

  // Try to find existing conversation
  const existing = await prisma.conversation.findUnique({
    where: {
      buyerId_farmerId_cropId: { buyerId, farmerId, cropId },
    },
    include: {
      crop: { select: { id: true, cropName: true, imageUrl: true } },
      buyer: { select: { id: true, name: true } },
      farmer: { select: { id: true, name: true } },
    },
  });

  if (existing) return existing;

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: { buyerId, farmerId, cropId },
    include: {
      crop: { select: { id: true, cropName: true, imageUrl: true } },
      buyer: { select: { id: true, name: true } },
      farmer: { select: { id: true, name: true } },
    },
  });

  return conversation;
};

const sendMessage = async (conversationId, senderId, content) => {
  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  if (conversation.buyerId !== senderId && conversation.farmerId !== senderId) {
    throw new ApiError(403, "You are not part of this conversation.");
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId, content },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Notify the other party via Socket.io
  const recipientId =
    conversation.buyerId === senderId
      ? conversation.farmerId
      : conversation.buyerId;

  notifyUser(recipientId, {
    title: "New Message",
    message: `${message.sender.name}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
    type: "info",
  });

  // Emit to conversation room for real-time display
  emitChatMessage(conversationId, message);

  return message;
};

const getConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { farmerId: userId }],
    },
    include: {
      buyer: { select: { id: true, name: true } },
      farmer: { select: { id: true, name: true } },
      crop: { select: { id: true, cropName: true, imageUrl: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Add unread count per conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isRead: false,
        },
      });
      return {
        ...conv,
        lastMessage: conv.messages[0] || null,
        unreadCount,
      };
    })
  );

  return conversationsWithUnread;
};

const getMessages = async (conversationId, userId) => {
  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  if (conversation.buyerId !== userId && conversation.farmerId !== userId) {
    throw new ApiError(403, "You are not part of this conversation.");
  }

  // Mark messages from the other party as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
};

const getUnreadCount = async (userId) => {
  const count = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ buyerId: userId }, { farmerId: userId }],
      },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return count;
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
};
