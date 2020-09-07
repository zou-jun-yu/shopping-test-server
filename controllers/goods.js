const fs = require("fs");
const path = require("path");
const { imageDirPath } = require("../untils/config");
const CategoryModel = require("../models/categories");
const GoodsModel = require("../models/goods");

const fsPromises = fs.promises;

//查询某个三级分类下的商品列表，或者搜索商品名称关键词得到一个商品列表
async function getGoodsList(req, res) {
  let {
    categoryId,
    keyWord,
    pageSize,
    pageNumber,
    sortField,
    isAscending,
  } = req.query;
  pageSize = parseInt(pageSize);
  pageNumber = parseInt(pageNumber);
  let total, query;
  if (categoryId) {
    //根据三级分类的_id得到它下面的商品列表
    total = await GoodsModel.countDocuments({ categoryId });
    query = GoodsModel.find({ categoryId });
  } else {
    //搜索关键词得到商品列表（与分类无关）
    total = await GoodsModel.countDocuments({
      goodsName: { $regex: new RegExp(keyWord, "gi") },
    });
    query = GoodsModel.find({
      goodsName: { $regex: new RegExp(keyWord, "gi") },
    });
  }
  //排序、分页
  query
    .sort({
      [sortField]: isAscending && (isAscending.toString() === "true" ? 1 : -1),
    })
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

//随机获取一些商品，用于在主页上展示
async function getRandomGoods(req, res) {
  const { goodsNumber } = req.query;
  GoodsModel.find().exec(function (error, goodsList) {
    goodsList = goodsList
      .sort((a, b) => Math.random() - 0.5)
      .slice(0, goodsNumber);
    if (error) {
      res.send({ code: -1, msg: "随机获取商品失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "随机获取商品成功", data: { goodsList } });
    }
  });
}

//添加或者修改某个商品
async function addOrUpdateGoods(req, res) {
  const goods = req.body;
  if (goods._id) {
    //修改
    GoodsModel.replaceOne({ _id: goods._id }, goods, function (error, goods) {
      if (error) {
        res.send({ code: -1, msg: "修改商品失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "修改商品成功", data: { goods } });
      }
    });
  } else {
    //添加
    new GoodsModel(goods).save(function (error, goods) {
      if (error) {
        res.send({ code: -1, msg: "添加商品失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "添加商品成功", data: { goods } });
      }
    });
  }
}

//根据_id数组删除这些商品以及它们对应的图片
async function deleteManyGoods(req, res) {
  const { deleteIdList } = req.body;
  const goodsList = await GoodsModel.find({ _id: { $in: deleteIdList } });
  //先删除图片
  const deleteImagesInfo = await Promise.all(
    goodsList
      .map((goods) => goods.goodsImages)
      .flat()
      .map((imageName) => fsPromises.unlink(path.join(imageDirPath, imageName)))
  );
  //再删除数据库中的这些商品数据
  const deleteGoodsInfo = await GoodsModel.deleteMany({
    _id: { $in: deleteIdList },
  });
  res.send({
    code: 0,
    msg: "删除商品成功",
    data: { deleteImagesInfo, deleteGoodsInfo },
  });
}

//根据_id获取商品对象和它的祖先链，以及每一个祖先下的所有子分类
async function getGoodsDetail(req, res) {
  const { _id } = req.query;
  let goodsDetail = {};
  //保存这个商品的祖先链
  let ancestorCategories = [];
  //保存每一个祖先下的所有子分类
  let ancestorForest = [];
  //找到这个商品
  GoodsModel.findOne({ _id })
    .then((goods) => {
      goodsDetail = goods;
      return CategoryModel.findOne({ _id: goods.categoryId });
    })
    //找到这个商品所属的三级分类对象
    .then((lv3Category) => {
      ancestorCategories.unshift(lv3Category);
      return CategoryModel.findOne({ _id: lv3Category.parentId });
    })
    //找到这个二级分类
    .then((lv2Category) => {
      ancestorCategories.unshift(lv2Category);
      return Promise.all([
        CategoryModel.findOne({ _id: lv2Category.parentId }),
        CategoryModel.find({ parentId: 0 }),
        CategoryModel.find({ parentId: lv2Category._id }),
      ]);
    })
    //找到这个商品的一级分类、所有一级分类、这个商品的二级分类下的所有三级分类
    .then(
      ([lv1Category, lv1Categories, targetLv3Categories]) => {
        ancestorCategories.unshift(lv1Category);
        ancestorForest = JSON.parse(JSON.stringify(lv1Categories));
        return Promise.all([
          CategoryModel.find({ parentId: lv1Category._id }),
          targetLv3Categories,
        ]);
      }
    )
    //找到这个商品的一级分类下的所有二级分类、这个商品的二级分类下的所有三级分类（由上一级Promise链节点传递过来）
    .then(([targetLv2Categories, targetLv3Categories]) => {
      //组装成森林
      let targetLv1Category = ancestorForest.filter(
        (lv1Category) =>
          lv1Category._id.toString() ===
          ancestorCategories[0]._id.toString()
      )[0];
      targetLv1Category.children = JSON.parse(
        JSON.stringify(targetLv2Categories)
      );
      targetLv1Category.children.filter(
        (targetLv2Category) =>
          targetLv2Category._id.toString() ===
          ancestorCategories[1]._id.toString()
      )[0].children = targetLv3Categories;
      res.send({
        code: 0,
        msg: "查询商品信息成功",
        data: { goodsDetail, ancestorCategories, ancestorForest },
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
  getRandomGoods,
};
