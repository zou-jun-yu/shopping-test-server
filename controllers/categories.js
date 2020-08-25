const CategoryModel = require("../models/categories");

//查询某一个分类对象
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

//查询某个分类对象下面的所有子分类，返回一个数组
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

//根据某个一级分类查询它的所有后代分类，一级分类下有二级分类，二级分类下有三级分类
async function getSubCategoriesLevel2AndLevel3(req, res) {
  const { parentId } = req.query;
  let categoriesLevel2 = await CategoryModel.find({ parentId });
  categoriesLevel2 = JSON.parse(JSON.stringify(categoriesLevel2));
  let categoriesLevel3WillFind = [];
  categoriesLevel2.forEach((categoryLevel2) =>
    categoriesLevel3WillFind.push(
      CategoryModel.find({ parentId: categoryLevel2._id })
    )
  );
  //categoriesLevel3是一个二维数组
  const categoriesLevel3 = await Promise.all(categoriesLevel3WillFind);
  //组装成某个一级分类下的后代森林
  categoriesLevel2.forEach(
    (categoryLevel2, index) =>
      (categoryLevel2.children = categoriesLevel3[index])
  );
  res.send({
    status: 0,
    msg: "查询该一级分类下的二、三级分类成功",
    data: {categoriesLevel2},
  });
}

//添加或者修改某个分类对象
async function addOrUpdateCategory(req, res) {
  const category = req.body;
  if (category._id) {
    //修改分类
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
    //添加分类
    new CategoryModel(category).save(function (error, category) {
      if (error) {
        res.send({ code: -1, msg: "添加分类失败", data: { error } });
      } else {
        res.send({ code: 0, msg: "添加分类成功", data: { category } });
      }
    });
  }
}

//删除某个分类
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

//随机获取一些三级分类，用于在主页中进行展示。三级分类跟一二级分类的区别是它有一个图片地址属性。
async function getRandomCategoriesLevel3(req, res) {
  const {categoryNumber} = req.query;
  CategoryModel.find({ categoryImage:{  $exists: true } }, function (error, categories) {
    categories = categories.sort((a,b)=>(Math.random()-0.5)).slice(0,categoryNumber);
    if (error) {
      res.send({ code: -1, msg: "获取随机分类失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "获取随机分类成功", data: { categories } });
    }
  });
}

module.exports = {
  getCategoryById,
  addOrUpdateCategory,
  deleteCategory,
  getSubCategories,
  getSubCategoriesLevel2AndLevel3,
  getRandomCategoriesLevel3
};
