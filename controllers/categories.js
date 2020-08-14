const CategoryModel = require("../models/categories");

async function getCategoryById(req, res) {
  const { _id } = req.query;
  CategoryModel.findOne({ _id }, function (error, category) {
    if (error) {
      res.send({ code: -1, msg: "查询此分类失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "查询此分类成功", data: { category } });
    }
  });
}

async function getSubCategories(req, res) {
  const { parentId } = req.query;
  CategoryModel.find({ parentId }, function (error, subCategories) {
    if (error) {
      res.send({ code: -1, msg: "查询子类列表失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "查询子类列表成功", data: { subCategories } });
    }
  });
}

//根据某个一级分类查询它的所有后代分类
async function getSubCategoriesLevel2AndLevel3(req, res) {
  const { parentId } = req.query;
  let categoriesLevel2 = await CategoryModel.find({ parentId });
  categoriesLevel2 = JSON.parse(JSON.stringify(categoriesLevel2));
  let CategoriesLevel3WillFind = [];
  categoriesLevel2.forEach((categoryLevel2) =>
    CategoriesLevel3WillFind.push(
      CategoryModel.find({ parentId: categoryLevel2._id })
    )
  );
  const CategoriesLevel3 = await Promise.all(CategoriesLevel3WillFind);
  categoriesLevel2.forEach(
    (categoryLevel2, index) =>
      (categoryLevel2.children = CategoriesLevel3[index])
  );
  res.send({
    status: 0,
    msg: "查询该一级分类下的二、三级分类成功",
    data: {categoriesLevel2},
  });
}

async function addOrUpdateCategory(req, res) {
  const category = req.body;
  if (category._id) {
    CategoryModel.replaceOne({ _id: category._id }, category, function (
      error,
      category
    ) {
      if (error) {
        res.send({ code: -1, msg: "修改分类失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "修改分类成功", data: { category } });
      }
    });
  } else {
    new CategoryModel(category).save(function (error, category) {
      if (error) {
        res.send({ code: -1, msg: "添加分类失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "添加分类成功", data: { category } });
      }
    });
  }
}

async function deleteCategory(req, res) {
  const { _id } = req.body;
  CategoryModel.deleteOne({ _id }, function (error, category) {
    if (error) {
      res.send({ code: -1, msg: "删除分类失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "删除分类成功", data: { category } });
    }
  });
}

module.exports = {
  getCategoryById,
  addOrUpdateCategory,
  deleteCategory,
  getSubCategories,
  getSubCategoriesLevel2AndLevel3,
};
