const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const auth = require("../controllers/AuthController");

router.get("/all", userController.getAllUsers);
router.get("/users", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/softdelete/:id", userController.deleteUser);

router.get("/user/profile",auth.authGuard, userController.getUserById);
router.put("/user/profile/update",auth.authGuard, userController.updateUserProfile);

module.exports = router;
