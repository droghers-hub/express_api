const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchController'); // path to your controller

// Search & log query
router.get('/items', searchController.searchProducts);

module.exports = router;
