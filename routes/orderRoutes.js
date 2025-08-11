const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Route công khai - tạo đơn hàng
router.post('/', orderController.createOrder);

// Route công khai - tracking đơn hàng bằng orderTime
router.get('/track/:orderTime', orderController.getOrderByOrderTime);

// Routes cho admin - cần authentication
router.get('/', authenticate, requireAdmin, orderController.getAllOrders);
router.get('/:id', authenticate, requireAdmin, orderController.getOrderById);
router.put('/:id', authenticate, requireAdmin, orderController.updateOrderStatus);
router.delete('/:id', authenticate, requireAdmin, orderController.deleteOrder);

module.exports = router;
