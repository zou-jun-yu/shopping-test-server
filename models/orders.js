const mongoose = require("mongoose");

const NOT_PAY="未付款";
const NOT_OUT_OF_THE_WAREHOUSE="未出仓";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartId: { type: String, required: true },
  address: { type: String, required: true },
  totlePrice: { type: Number, required: true },
  orderTime: { type: Date, required: true, default: Date.now() },
  orderStatus:{ type: String, required: true, default:NOT_PAY }
});

const OrderModel = mongoose.model("order", orderSchema);

module.exports = OrderModel;
