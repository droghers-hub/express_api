const router = require("express").Router();
const ctrl = require("../controllers/BancatbraController");

// 3 independent endpoints, one controller
router.get("/banners", ctrl.getBanners);
router.get("/brands", ctrl.getBrands);
router.get("/categories", ctrl.getCategories);

module.exports = router;
