var mongoose = require('mongoose');

var GoodsSchema = new mongoose.Schema({
    goodsName: { type: String, required: true },
    goodsDescription: { type: String },
    marketPrice: { type: Number },
    nowPrice: { type: Number, required: true },
    goodsImages: { type: Array, required: true },
    categoryId: { type: String, required: true },
    goodsAmount: { type: Number, required: true },
    salesNumber: { type: Number, required: true, default: 0 }
});

var GoodsModel = mongoose.model('goods', GoodsSchema);

module.exports = GoodsModel;