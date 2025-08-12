// routes/orders.routes.js
const router = require("express").Router();
const orderController = require("../controllers/OrderController");

router.post("/placeorder",orderController.placeOrder);

module.exports = router;
