const fs = require("fs");
const path = require("path");
const imageDirPath = path.join(__dirname, "..", "public/images/uploads");
const GoodsModel = require("../models/goods");
const CategoryModel = require("../models/categories");
const fsPromises = fs.promises;

async function getGoodsList(req, res) {
  let { categoryId, pageSize, pageNumber } = req.query;
  pageSize = parseInt(pageSize);
  pageNumber = parseInt(pageNumber);
  const total = await GoodsModel.count({ categoryId });
  GoodsModel.find({ categoryId })
    .sort({ marketPrice: 1 })
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize)
    .exec(function (error, goodsList) {
      if (error) {
        res.send({ code: -1, msg: "查询商品列表失败", data: { error } });
      } else {
        res.send({
          code: 0,
          msg: "查询商品列表成功",
          data: { goodsList, total },
        });
      }
    });
}

//跟上一个处理函数相似度很高，可以考虑将它们合成一个。
async function searchGoods(req, res) {
  let { keyWord, pageSize, pageNumber } = req.query;
  pageSize = parseInt(pageSize);
  pageNumber = parseInt(pageNumber);
  const total = await GoodsModel.count({
    goodsName: { $regex: new RegExp(keyWord, "gi") },
  });
  GoodsModel.find({ goodsName: { $regex: new RegExp(keyWord, "gi") } })
    .sort({ marketPrice: 1 })
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize)
    .exec(function (error, goodsList) {
      if (error) {
        res.send({ code: -1, msg: "搜索商品失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "搜索商品成功", data: { goodsList, total } });
      }
    });
}

async function addOrUpdateGoods(req, res) {
  const goods = req.body;
  if (goods._id) {
    GoodsModel.replaceOne({ _id: goods._id }, goods, function (error, goods) {
      if (error) {
        res.send({ code: -1, msg: "修改商品失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "修改商品成功", data: { goods } });
      }
    });
  } else {
    new GoodsModel(goods).save(function (error, goods) {
      if (error) {
        res.send({ code: -1, msg: "添加商品失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "添加商品成功", data: { goods } });
      }
    });
  }
}

async function deleteManyGoods(req, res) {
  const { deleteIdList } = req.body;
  const goodsList = await GoodsModel.find({ _id: { $in: deleteIdList } });
  const deleteImagesInfo = await Promise.all(
    goodsList
      .map((goods) => goods.goodsImages)
      .flat()
      .map((imageName) => fsPromises.unlink(path.join(imageDirPath, imageName)))
  );
  const deleteGoodsInfo = await GoodsModel.deleteMany({
    _id: { $in: deleteIdList },
  });
  res.send({
    code: 0,
    msg: "删除商品成功",
    data: { deleteImagesInfo, deleteGoodsInfo },
  });
}

//使用promise的写法看起来是比较啰嗦一点，还是async/await比较简洁，这里纯粹只是为了练习一下promise。
async function getGoodsDetail(req, res) {
  const { _id } = req.query;
  let goodsDetail = {};
  let goodsCategoryChainNodes = [];
  let goodsCategoryOptions = [];
  GoodsModel.findOne({ _id })
    .then((goods) => {
      goodsDetail = goods;
      return CategoryModel.findOne({ _id: goods.categoryId });
    })
    .then((levelThreeCategory) => {
      goodsCategoryChainNodes.unshift(levelThreeCategory);
      return CategoryModel.findOne({ _id: levelThreeCategory.parentId });
    })
    .then((levelTwoCategory) => {
      goodsCategoryChainNodes.unshift(levelTwoCategory);
      return Promise.all([
        CategoryModel.findOne({ _id: levelTwoCategory.parentId }),
        CategoryModel.find({ parentId: 0 }),
        CategoryModel.find({ parentId: levelTwoCategory._id }),
      ]);
    })
    .then(
      ([levelOneCategory, levelOneCategories, targetLevelThreeCategories]) => {
        goodsCategoryChainNodes.unshift(levelOneCategory);
        goodsCategoryOptions = JSON.parse(JSON.stringify(levelOneCategories));
        return Promise.all([
          CategoryModel.find({ parentId: levelOneCategory._id }),
          targetLevelThreeCategories,
        ]);
      }
    )
    .then(([targetLevelTwoCategories, targetLevelThreeCategories]) => {
      let targetLevelOneCategory = goodsCategoryOptions.filter(
        (goodsCategoryOption) =>
          goodsCategoryOption._id.toString() ===
          goodsCategoryChainNodes[0]._id.toString()
      )[0];
      targetLevelOneCategory.children = JSON.parse(
        JSON.stringify(targetLevelTwoCategories)
      );
      targetLevelOneCategory.children.filter(
        (targetLevelTwoCategory) =>
          targetLevelTwoCategory._id.toString() ===
          goodsCategoryChainNodes[1]._id.toString()
      )[0].children = targetLevelThreeCategories;
      res.send({
        code: 0,
        msg: "查询商品信息成功",
        data: { goodsDetail, goodsCategoryChainNodes, goodsCategoryOptions },
      });
    })
    .catch((error) => {
      res.send({
        code: -1,
        msg: "查询商品信息失败",
        data: { error: error.message },
      });
    });
}

module.exports = {
  addOrUpdateGoods,
  getGoodsDetail,
  getGoodsList,
  deleteManyGoods,
  searchGoods,
};
