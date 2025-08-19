const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");

router.get("/filter", productController.getProducts);
router.get("/feat", productController.getProductsByHardcodedCategories);
router.get("/:product_id", productController.getProductById);
module.exports = router;
