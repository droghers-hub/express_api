const express = require("express");
const router = express.Router();

const addressController = require("../controllers/AddressesController");

// Create a new address
router.post("/new", addressController.create);

// List all addresses for a user
// GET /addresses/user/:user_id
router.get("/user", addressController.list);

// Update an address by ID
router.put("/update/:id", addressController.update);

// Delete an address by ID
router.delete("/delete/:id", addressController.remove);

router.get("/postcodes", addressController.getAllPostcodes);
module.exports = router;
