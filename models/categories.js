const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  parentId: { type: String, required: true },
  categoryImage: { type: String },
});

const CategoryModel = mongoose.model("category", categorySchema);

module.exports = CategoryModel;
