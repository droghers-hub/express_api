// controllers/BancatbraController.js
const {banners,brands,categories} = require("../models");

module.exports = {
  async getBanners(req, res) {
    try {
      const rows = await banners.findAll({ order: [["id", "DESC"]] });
      res.json({ success: true, message: "banners fetched successfully", data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch banners", error: err.message });
    }
  },

  async getBrands(req, res) {
    try {
      const rows = await brands.findAll({ order: [["id", "DESC"]] });
      res.json({ success: true, message: "brands fetched successfully", data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch brands", error: err.message });
    }
  },

  async getCategories(req, res) {
    try {
      const rows = await categories.findAll({ order: [["id", "DESC"]] });
      res.json({ success: true, message: "category fetched successfully", data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch categories", error: err.message });
    }
  },
};
