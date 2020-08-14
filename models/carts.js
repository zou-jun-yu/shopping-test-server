const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  goodsNumber: { type: Number, required: true },
  checked: { type: Boolean, required: true },
  //保存用户购买时的商品信息作为一个快照，因为商品价格等信息以后可能会变化。
  goodsId: { type: String, required: true },
  goodsName: { type: String, required: true },
  goodsDescription: { type: String },
  marketPrice: { type: Number },
  nowPrice: { type: Number, required: true },
  goodsImages: { type: Array, required: true },
  categoryId: { type: String, required: true },
  goodsAmount: { type: Number, required: true },
  salesNumber: { type: Number, required: true },
});
const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  //其实购物车条目要么前后端都用对象，要么都用数组会比较好，这样就不用进行转化了
  cartItems: { type: [CartItemSchema], required: true },
});

const CartModel = mongoose.model("cart", CartSchema);

module.exports = CartModel;
