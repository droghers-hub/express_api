const { addresses, postcodes, users } = require("../models");

// Create Address
exports.create = async (req, res) => {
  console.log("Creating address...");
  try {
    console.log("Request body:", req.body);
    const { postcode_id, user_id, name, care_of, phone, line_1, line_2, type } =
      req.body;

    console.log(req.body, "...................");

    // Validation
    if (!postcode_id) {
      console.error("Address creation failed: postcode_id is missing");
      return res.status(400).json({ message: "postcode_id is required" });
    }
    if (!user_id) {
      console.error("Address creation failed: user_id is missing");
      return res.status(400).json({ message: "user_id is required" });
    }
    if (!name || !care_of || !phone || !line_1 || !line_2) {
      console.error("Address creation failed: Missing required fields", {
        name: !!name,
        care_of: !!care_of,
        phone: !!phone,
        line_1: !!line_1,
        line_2: !!line_2,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if postcode exists
    const postcodeExists = await postcodes.findByPk(postcode_id);
    console.log("Postcode exists:", postcodeExists);
    // if (!postcodeExists) {
    //   console.error("Address creation failed: Postcode not found", { postcode_id });
    //   return res.status(404).json({ message: "Postcode not found" });
    // }

    // Check if user exists
    const userExists = await users.findByPk(user_id);
    if (!userExists) {
      console.error("Address creation failed: User not found", { user_id });
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
      status: "ACTIVE",
    });

    console.log("Address created successfully", {
      address_id: newAddress.id,
      user_id,
    });
    res.status(201).json({
      success: true,
      message: "Address created successfully",
      id: newAddress.id,
    });
  } catch (error) {
    console.error("Error creating address:", {
      message: error.message,
      stack: error.stack,
      user_id: req.body?.user_id,
      postcode_id: req.body?.postcode_id,
    });
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// List all addresses for a user
exports.list = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      console.error(
        "Address list failed: user_id is missing from query parameters"
      );
      return res.status(400).json({
        success: false,
        message: "user_id is required in query parameters",
      });
    }

    console.log("Fetching addresses with postcode info for user:", user_id);

    const alladdresses = await addresses.findAll({
      where: { user_id },
      include: [
        {
          model: postcodes,
          as: "postcode",
          attributes: [
            "id",
            "code",
            "post_office",
            "city",
            "district",
            "state",
            "country",
            "delivery_charge",
            "status",
          ],
        },
      ],
      order: [
        ["default", "DESC"],
        ["id", "ASC"],
      ],
    });

    console.log("Successfully fetched addresses with postcode info", {
      user_id,
      count: alladdresses.length,
    });

    res.status(200).json({
      success: true,
      message: "Fetched the addresses with postcode information successfully",
      items: alladdresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", {
      message: error.message,
      stack: error.stack,
      user_id: req.query?.user_id,
    });
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Address
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { postcode_id, name, care_of, phone, line_1, line_2, type, status } =
      req.body;

    if (!id) {
      console.error(
        "Address update failed: address id is missing from parameters"
      );
      return res.status(400).json({ message: "Address ID is required" });
    }

    console.log("Updating address:", { address_id: id });
    const address = await addresses.findByPk(id);
    if (!address) {
      console.error("Address update failed: Address not found", {
        address_id: id,
      });
      return res.status(404).json({ message: "Address not found" });
    }

    if (postcode_id) {
      console.log("Validating postcode:", postcode_id);
      const postcodeExists = await postcodes.findByPk(postcode_id);
      if (!postcodeExists) {
        console.error("Address update failed: Postcode not found", {
          address_id: id,
          postcode_id,
        });
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
      status: status || address.status,
    });

    console.log("Address updated successfully", { address_id: id });
    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("Error updating address:", {
      message: error.message,
      stack: error.stack,
      address_id: req.params?.id,
      update_data: req.body,
    });
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete Address
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.error(
        "Address removal failed: address id is missing from parameters"
      );
      return res.status(400).json({ message: "Address ID is required" });
    }

    console.log("Removing address:", { address_id: id });
    const address = await addresses.findByPk(id);

    if (!address) {
      console.error("Address removal failed: Address not found", {
        address_id: id,
      });
      return res.status(404).json({ message: "Address not found" });
    }

    // Soft delete: mark status as INACTIVE instead of deleting
    await address.update({ status: "INACTIVE" });

    console.log("Address marked as inactive successfully", { address_id: id });
    res.status(200).json({
      message: "Address marked as inactive instead of deletion",
    });
  } catch (error) {
    console.error("Error removing address:", {
      message: error.message,
      stack: error.stack,
      address_id: req.params?.id,
    });
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getAllPostcodes = async (req, res) => {
  try {
    console.log("Fetching all active postcodes");
    const allPostcodes = await postcodes.findAll({
      attributes: ["id", "code", "post_office", "city"],
      where: { status: "ACTIVE" },
    });

    console.log("Successfully fetched postcodes", {
      count: allPostcodes.length,
    });
    res.status(200).json({
      success: true,
      message: "Postcodes retrieved successfully",
      items: allPostcodes,
    });
  } catch (error) {
    console.error("Error fetching postcodes:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
