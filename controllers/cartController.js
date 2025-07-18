const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  const userId = req.userId;
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  res.json(cart || { userId, items: [] });
};

exports.addToCart = async (req, res) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.json(cart);
};

exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

  const item = cart.items.find(item => item.productId.toString() === productId);
  if (item) {
    item.quantity = quantity;
    await cart.save();
    return res.json(cart);
  }

  res.status(404).json({ message: 'Sản phẩm không có trong giỏ' });
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();
  res.json(cart);
};
