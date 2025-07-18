const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartController');

const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.put('/update', authMiddleware, updateCartItem);
router.delete('/remove', authMiddleware, removeFromCart);

module.exports = router;
