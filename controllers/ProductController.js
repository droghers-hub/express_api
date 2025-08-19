const { products, Brands, categories } = require("../models");

exports.getProducts = async (req, res) => {
  try {
    const { category_id, brand_id } = req.query;

    const whereClause = {};
    if (category_id) whereClause.category_id = category_id;
    if (brand_id) whereClause.brand_id = brand_id;

    const items = await products.findAll({
      where: whereClause,
      attributes: ["name","description", "photo", "retail_price", "current_price", "unit"],
      include: [
        {
          model: Brands,
          as: "brand",
          attributes: ["id", "name","photo"],
        },
        {
          model: categories,
          as: "category",
          attributes: ["id", "name","photo"],
        },
      ],
    });

    res.status(200).json({ success: true, message: "Products fetched successfully", data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

const seasonalCategoryId = parseInt(process.env.SEASONAL_CATEGORY_ID, 10);
const featuredCategoryId = parseInt(process.env.FEATURED_CATEGORY_ID, 10);

exports.getProductsByHardcodedCategories = async (req, res) => {
  try {
    const categoryIds = [seasonalCategoryId, featuredCategoryId];

    const categoryData = await categories.findAll({
      where: { id: categoryIds },
      attributes: ["id", "name"],
    });

    const productsData = await products.findAll({
      where: { category_id: categoryIds },
      attributes: ["name", "photo", "retail_price", "current_price", "unit", "category_id"],
      include: [
        {
          model: Brands,
          as: "brand",
          attributes: ["id", "name"],
        },
      ],
    });

    const grouped = categoryData.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      products: productsData.filter((p) => p.category_id === cat.id),
    }));

    res.status(200).json({ success: true, message: "Products fetched successfully", data: grouped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};