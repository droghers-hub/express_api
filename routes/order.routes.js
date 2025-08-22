const router = require("express").Router();
const orderController = require("../controllers/OrderController");
const deliveryController = require("../controllers/DeliveryController");
router.post("/placeorder", orderController.placeOrder);
router.get("/user/:user_id", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);

router.get("/delivery/orders", deliveryController.getAllActiveOrders);
router.get("/delivery/orders/:orderId", deliveryController.getOrderById);
router.put(
  "/delivery/orders/update/:orderId",
  deliveryController.updateOrderStatus
);
router.put(
  "/delivery/orders/transit",
  deliveryController.markAllOrdersInTransit
);
module.exports = router;
