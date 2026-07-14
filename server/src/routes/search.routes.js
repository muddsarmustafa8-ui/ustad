const express = require('express');
const { searchBusinesses } = require('../controllers/search.controller');

const router = express.Router();

router.get('/businesses', searchBusinesses);

module.exports = router;
