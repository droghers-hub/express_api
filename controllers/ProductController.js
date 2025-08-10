const { products, brands, categories } = require("../models");

exports.getProducts = async (req, res) => {
  try {
    const { category_id, brand_id } = req.query;

    const whereClause = {};
    if (category_id) whereClause.category_id = category_id;
    if (brand_id) whereClause.brand_id = brand_id;

    const items = await products.findAll({
      where: whereClause,
      attributes: ["name", "photo", "retail_price", "current_price", "unit"],
      include: [
        {
          model: brands,
          attributes: ["id", "name"],
        },
        {
          model: categories,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
