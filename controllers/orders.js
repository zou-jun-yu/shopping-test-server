const OrderModel = require("../models/orders");

async function addOrder(req, res) {
  const order = req.body;
  new OrderModel(order).save(function (error, order) {
    if (error) {
      res.send({ code: -1, msg: "添加订单失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "添加订单成功", data: { order } });
    }
  });
}

async function getOrders(req, res) {
  OrderModel.find({}, function (error, orders) {
    if (error) {
      res.send({ code: -1, msg: "查询所有订单失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "查询所有订单成功", data: { orders } });
    }
  });
}

module.exports = {
  addOrder,
  getOrders,
};
