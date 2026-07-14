const express = require('express');
const { googleLogin, facebookLogin } = require('../controllers/socialAuth.controller');
const router = express.Router();

router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);

module.exports = router;
