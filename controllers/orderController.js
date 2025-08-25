const Order = require('../models/Order');

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const {
      orderTime,
      customerInfo,
      items,
      subtotal,
      shippingFee = 0,
      discount = 0,
      total
    } = req.body;

    // Validate required fields
    if (!orderTime || !customerInfo || !items || !subtotal || !total) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email || !customerInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin khách hàng không đầy đủ'
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm'
      });
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ orderTime });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã tồn tại'
      });
    }

    const newOrder = new Order({
      orderTime,
      customerInfo,
      items,
      subtotal,
      shippingFee,
      discount,
      total
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      data: savedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn hàng',
      error: error.message
    });
  }
};

// Lấy tất cả đơn hàng (dành cho admin)
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Xây dựng filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderTime: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Lấy đơn hàng với pagination
    const orders = await Order.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số đơn hàng
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Tính toán thống kê
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          shippingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipping'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        stats: stats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          shippingOrders: 0,
          deliveredOrders: 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật đơn hàng',
      error: error.message
    });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đơn hàng',
      error: error.message
    });
  }
};

// Lấy đơn hàng theo orderTime (cho việc tracking)
exports.getOrderByOrderTime = async (req, res) => {
  try {
    const { orderTime } = req.params;

    const order = await Order.findOne({ orderTime });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error getting order by orderTime:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đơn hàng',
      error: error.message
    });
  }
};
