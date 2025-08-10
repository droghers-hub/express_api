const { addresses, postcodes, users } = require("../models");

// Create Address
exports.create = async (req, res) => {
    console.log("Creating address...");
  try {
    console.log("Request body:", req.body);
    const {
      postcode_id,
      user_id,
      name,
      care_of,
      phone,
      line_1,
      line_2,
      type
    } = req.body;


    console.log(req.body,'...................')

    // Validation
    if (!postcode_id) {
      return res.status(400).json({ message: "postcode_id is required" });
    }
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }
    if (!name || !care_of || !phone || !line_1 || !line_2) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if postcode exists
    const postcodeExists = await postcodes.findByPk(postcode_id);
    console.log("Postcode exists:", postcodeExists);
    // if (!postcodeExists) {
    //   return res.status(404).json({ message: "Postcode not found" });
    // }

    // Check if user exists
    const userExists = await users.findByPk(user_id);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // First address for this user is default
    const hasAddress = await addresses.findOne({ where: { user_id } });
    const isDefault = hasAddress ? false : true;

    const newAddress = await addresses.create({
      postcode_id,
      user_id,
      name,
      care_of,
      phone,
      line_1,
      line_2,
      type: type || "OTHER",
      default: isDefault,
      status: "ACTIVE"
    });

    res.status(201).json({
      message: "Address created successfully",
      id: newAddress.id
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// List all addresses for a user
exports.list = async (req, res) => {
  try {
    const { user_id } = req.query;
    const alladdresses = await addresses.findAll({
      where: { user_id }
    });
    res.status(200).json({ items: alladdresses });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update Address
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      postcode_id,
      name,
      care_of,
      phone,
      line_1,
      line_2,
      type,
      status
    } = req.body;

    const address = await addresses.findByPk(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (postcode_id) {
      const postcodeExists = await postcodes.findByPk(postcode_id);
      if (!postcodeExists) {
        return res.status(404).json({ message: "Postcode not found" });
      }
    }

    await address.update({
      postcode_id: postcode_id || address.postcode_id,
      name: name || address.name,
      care_of: care_of || address.care_of,
      phone: phone || address.phone,
      line_1: line_1 || address.line_1,
      line_2: line_2 || address.line_2,
      type: type || address.type,
      status: status || address.status
    });

    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete Address
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await addresses.findByPk(id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Soft delete: mark status as INACTIVE instead of deleting
    await address.update({ status: "INACTIVE" });

    res.status(200).json({ message: "Address marked as inactive instead of deletion" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

