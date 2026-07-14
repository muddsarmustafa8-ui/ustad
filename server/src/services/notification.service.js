const Notification = require('../models/Notification');

const sendNotification = async (recipientId, title, message, type = 'system', relatedId = null, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      relatedId,
    });

    if (io) {
      // Emit real-time notification to the user's private socket room (room name = recipientId)
      io.to(recipientId.toString()).emit('new-notification', notification);
    }

    return notification;
  } catch (error) {
    console.error(`❌ Notification creation failed: ${error.message}`);
  }
};

module.exports = {
  sendNotification,
};
