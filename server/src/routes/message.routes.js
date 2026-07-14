const express = require('express');
const { sendMessage, getChatThread, getConversations } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // all chat operations require authentication

router.post('/', sendMessage);
router.get('/thread/:otherUserId', getChatThread);
router.get('/conversations', getConversations);

module.exports = router;
