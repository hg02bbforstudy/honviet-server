// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  image: String,
  price: Number,
  oldPrice: Number,
});

module.exports = mongoose.model('Product', productSchema);
