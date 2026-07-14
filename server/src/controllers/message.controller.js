const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
  const { recipient: recipientId, message, business: businessId } = req.body;

  if (!recipientId || !message) {
    return sendError(res, 'Recipient ID and message body are required', 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return sendError(res, 'Recipient user not found', 404);
  }

  const newMessage = await Message.create({
    sender: req.user.id,
    recipient: recipientId,
    business: businessId || null,
    message,
  });

  // Emit socket event to recipient's room
  try {
    const io = req.app.get('io');
    if (io) {
      io.to(recipientId.toString()).emit('new-message', {
        ...newMessage.toJSON(),
        sender: {
          _id: req.user._id,
          fullName: req.user.fullName,
          avatar: req.user.avatar,
        },
      });
    }
  } catch (error) {
    console.error('❌ Failed to emit socket chat event:', error.message);
  }

  return sendSuccess(res, newMessage, 'Message sent successfully', 201);
});

// @desc    Get chat thread with a user
// @route   GET /api/messages/thread/:otherUserId
// @access  Private
const getChatThread = asyncHandler(async (req, res, next) => {
  const { otherUserId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user.id, recipient: otherUserId },
      { sender: otherUserId, recipient: req.user.id },
    ],
  })
    .populate('sender', 'fullName avatar')
    .populate('recipient', 'fullName avatar')
    .sort('createdAt');

  // Mark all unread messages received from the other user as read
  await Message.updateMany(
    { sender: otherUserId, recipient: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  return sendSuccess(res, messages, 'Fetched chat history successfully');
});

// @desc    Get user's conversations list (recent contacts)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Aggregate messages to find unique chat contacts
  const recentMessages = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', userId] },
            '$recipient',
            '$sender',
          ],
        },
        lastMessage: { $first: '$message' },
        lastMessageTime: { $first: '$createdAt' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', userId] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $sort: { lastMessageTime: -1 },
    },
  ]);

  // Populate contact user details
  const conversations = await Promise.all(
    recentMessages.map(async conv => {
      const contact = await User.findById(conv._id).select('fullName email avatar role');
      return {
        contact,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount,
      };
    })
  );

  return sendSuccess(res, conversations, 'Fetched conversations successfully');
});

module.exports = {
  sendMessage,
  getChatThread,
  getConversations,
};
