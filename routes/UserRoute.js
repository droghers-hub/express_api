const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");


router.get("/all", userController.getAllUsers);
router.get("/users", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/softdelete/:id", userController.deleteUser);


module.exports = router;
