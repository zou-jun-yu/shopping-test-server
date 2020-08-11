const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  goodsNumber: { type: Number, required: true },
  checked: { type: Boolean, required: true },
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
  cartItems: { type: [CartItemSchema], required: true },
});

const CartModel = mongoose.model("cart", CartSchema);

module.exports = CartModel;
