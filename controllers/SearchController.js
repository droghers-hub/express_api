const { Op } = require('sequelize');
const { products } = require('../models'); // adjust path if needed

const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, status = 'ACTIVE' } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = q.trim();

    // Search for names starting with query (case-insensitive)
    const productResults = await products.findAndCountAll({
      where: {
        name: { [Op.like]: `${searchTerm}%` }, // starts with
        status
      },
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true, message: 'Products successfully fetched',
      query: searchTerm,
      total_results: productResults.count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(productResults.count / parseInt(limit)),
      data: productResults.rows
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during product search',
      error: error.message
    });
  }
};

module.exports = { searchProducts };
