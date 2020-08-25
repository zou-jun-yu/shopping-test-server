const mongoose = require("mongoose");

const NOT_PAY="未付款";
const NOT_OUT_OF_THE_WAREHOUSE="未出仓";

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

//订单模型
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartItems: { type: [CartItemSchema], required: true },
  address: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  orderTime: { type: Date, required: true, default: Date.now() },
  orderStatus:{ type: String, required: true, default:NOT_PAY }
});

const OrderModel = mongoose.model("order", orderSchema);

module.exports = OrderModel;
