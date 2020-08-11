const CartModel = require("../models/carts");
const GoodsModel = require("../models/goods");
const UserModel = require("../models/users");

async function modifyCart(req, res) {
  const username = req.session.username;
  const { cartInfo } = req.body;
  if (!username) {
    res.send({ status: -1, msg: "请先登录！" });
    return;
  }
  const user = await UserModel.findOne({ username });
  const cartFromdb = await CartModel.findOne({ userId: user._id });
  if (cartInfo === {} && cartFromdb) {
    const deleteInfo = await CartModel.deleteOne({ userId: user._id });
    res.send({ status: 0, msg: "删除购物车成功！", deleteInfo });
    return;
  }
  const goodsList = await GoodsModel.find({
    _id: { $in: Object.keys(cartInfo) },
  });
  const cartItems = goodsList.map((goods) => ({
    goodsNumber: cartInfo[goods._id].count,
    checked: cartInfo[goods._id].checked,
    goodsId: goods._id,
    goodsName: goods.goodsName,
    goodsDescription: goods.goodsDescription,
    marketPrice: goods.marketPrice,
    nowPrice: goods.nowPrice,
    goodsImages: goods.goodsImages,
    categoryId: goods.categoryId,
    goodsAmount: goods.goodsAmount,
    salesNumber: goods.salesNumber,
  }));
  if (cartFromdb) {
    const resultInfo = await CartModel.updateOne(
      { userId: user._id },
      { $set: { cartItems } }
    );
    if (resultInfo.ok) {
      res.send({ status: 0, msg: "修改购物车成功！", resultInfo });
      return;
    }
  } else {
    const newCart = await CartModel.insertMany({ userId: user._id, cartItems });
    if (newCart) {
      res.send({ status: 0, msg: "添加购物车成功！", newCart });
      return;
    }
  }
  res.send({ status: -1, msg: "更新购物车失败" });
}

async function getCart(req, res) {
  const username = req.session.username;
  if (!username) {
    res.send({ status: -1, msg: "请先登录！" });
    return;
  }
  const user = await UserModel.findOne({ username });
  const cartFromdb = await CartModel.findOne({ userId: user._id });
  let cart = JSON.parse(JSON.stringify(cartFromdb));
  if (cart) {
    cart = cart.cartItems.reduce((prev, curr) => {
      prev[curr.goodsId] = {...curr,count:curr.goodsNumber};
      return prev;
    }, {});
    res.send({ status: 0, msg: "获取购物车数据成功！", cart });
  } else {
    res.send({ status: -1, msg: "您的购物车是空的" });
  }
}

module.exports = {
  modifyCart,
  getCart,
};
