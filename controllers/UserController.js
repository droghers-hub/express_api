// controllers/user.controller.js

const { addresses, users } = require("../models"); // adjust path to your models folder

// READ All Users
exports.getAllUsers = async (req, res) => {
  try {
    const Users = await users.findAll();
    res.json(Users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    const User = await users.findByPk(id);

    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(User);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// UPDATE User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.query;

    const [updated] = await users.update(req.body, {
      where: { id },
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await users.findByPk(id);
    return res.status(200).json({
      message: "User updated successfully",
      body: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    // Soft delete: mark the user as inactive or deleted
    const [updated] = await users.update(
      { status: "inactive" }, // or { is_deleted: true }
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User soft deleted successfully",
    });
  } catch (error) {
    console.error("Error soft deleting user:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, email } = req.body;
    const user = await users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email;

    if (email && email.trim()) {
      const existingUser = await users.findOne({
        where: {
          email: email.trim(),
          id: { [require("sequelize").Op.ne]: userId },
        },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered with another account",
        });
      }
    }

    await user.update(updateData);
    const updatedUser = await users.findByPk(userId);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        photo: updatedUser.photo,
        points: updatedUser.points,
        status: updatedUser.status,
        user_otp: updatedUser.user_otp,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: err.message,
    });
  }
};
