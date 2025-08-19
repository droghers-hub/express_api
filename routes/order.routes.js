const router = require("express").Router();
const orderController = require("../controllers/OrderController");

router.post("/placeorder",orderController.placeOrder);
router.get("/user/:user_id", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
module.exports = router;
