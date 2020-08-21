const express = require("express");
const multer = require("multer");


const { uploadImage, deleteUploadImage } = require("../controllers/uploads");


const {
  addOrUpdateCategory,
  deleteCategory,
  getSubCategories,
  getSubCategoriesLevel2AndLevel3,
  getCategoryById,
  getRandomCategoriesLevel3,
} = require("../controllers/categories");


const {
  addOrUpdateGoods,
  deleteManyGoods,
  getGoodsDetail,
  getGoodsList,
  searchGoods,
  getRandomGoods,
} = require("../controllers/goods");


const { getOrders } = require("../controllers/orders");
const { getCart, modifyCart } = require("../controllers/carts");


const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});
const upload = multer({ storage: storage });


router.post("/uploadImage", upload.single("goods"), uploadImage);
router.post("/deleteUploadImage", deleteUploadImage);


router.get("/getCategoryById", getCategoryById);
router.post("/addOrUpdateCategory", addOrUpdateCategory);
router.post("/deleteCategory", deleteCategory);
router.get("/getSubCategories", getSubCategories);
router.get("/getSubCategoriesLevel2AndLevel3", getSubCategoriesLevel2AndLevel3);
router.get("/getRandomCategoriesLevel3", getRandomCategoriesLevel3);

router.post("/addOrUpdateGoods", addOrUpdateGoods);
router.post("/deleteManyGoods", deleteManyGoods);
router.get("/getGoodsDetail", getGoodsDetail);
router.get("/getGoodsList", getGoodsList);
router.get("/searchGoods", searchGoods);
router.get("/getRandomGoods", getRandomGoods);


router.get("/getCart", getCart);
router.post("/modifyCart", modifyCart);


router.get("/getOrders", getOrders);


module.exports = router;
