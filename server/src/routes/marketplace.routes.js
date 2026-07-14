const express = require('express');
const { getMarketplaceHome } = require('../controllers/marketplace.controller');

const router = express.Router();

router.get('/home', getMarketplaceHome);

module.exports = router;