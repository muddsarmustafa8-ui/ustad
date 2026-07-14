const express = require('express');
const { updateProfile, getFavorites, toggleFavorite } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // all user routes require authentication

router.put('/profile', updateProfile);
router.get('/favorites', getFavorites);
router.post('/favorites/:businessId', toggleFavorite);

module.exports = router;
