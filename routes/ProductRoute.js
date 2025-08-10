const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");

router.get("/filter", productController.getProducts);
router.get("/feat", productController.getProductsByHardcodedCategories);

module.exports = router;
