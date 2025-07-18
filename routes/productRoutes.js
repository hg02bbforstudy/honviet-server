const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - lấy toàn bộ sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('❌ Lỗi khi lấy sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
