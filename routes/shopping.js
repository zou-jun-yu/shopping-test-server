const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { uploadImage, deleteUploadImage } = require("../controllers/uploads");
const { imageDirPath } = require("../untils/config");

const {
  addOrUpdateCategory,
  deleteCategory,
  getSubCategories,
  getDescendantCategories,
  getCategoryById,
  getRandomLv3Categories,
} = require("../controllers/categories");

const {
  addOrUpdateGoods,
  deleteManyGoods,
  getGoodsDetail,
  getGoodsList,
  getRandomGoods,
} = require("../controllers/goods");

const { getOrders } = require("../controllers/orders");
const { getCart, modifyCart } = require("../controllers/carts");

const router = express.Router();

//图片上传和删除
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(imageDirPath)) {
      fs.mkdir(imageDirPath, function (err) {
        if (err) {
          console.log(err);
        } else {
          cb(null, imageDirPath);
        }
      });
    } else {
      cb(null, imageDirPath);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});
const upload = multer({ storage: storage });

router.post("/uploadImage", upload.single("goods"), uploadImage);
router.post("/deleteUploadImage", deleteUploadImage);

//商品分类相关
router.get("/getCategoryById", getCategoryById);
router.post("/addOrUpdateCategory", addOrUpdateCategory);
router.post("/deleteCategory", deleteCategory);
router.get("/getSubCategories", getSubCategories);
router.get("/getDescendantCategories", getDescendantCategories);
router.get("/getRandomLv3Categories", getRandomLv3Categories);

//商品相关
router.post("/addOrUpdateGoods", addOrUpdateGoods);
router.post("/deleteManyGoods", deleteManyGoods);
router.get("/getGoodsDetail", getGoodsDetail);
router.get("/getGoodsList", getGoodsList);
router.get("/getRandomGoods", getRandomGoods);

//购物车
router.get("/getCart", getCart);
router.post("/modifyCart", modifyCart);

//订单
router.get("/getOrders", getOrders);

module.exports = router;
