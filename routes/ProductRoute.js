const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");

router.get("/filter", productController.getProducts);

module.exports = router;
