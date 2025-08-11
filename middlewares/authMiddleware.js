const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ADMIN_EMAILS } = require('../config/constants');

// Middleware xác thực token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Không có token xác thực' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false,
      message: 'Token không hợp lệ' 
    });
  }
};

// Middleware kiểm tra quyền admin (dựa trên email)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa xác thực người dùng'
    });
  }

  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập. Cần quyền admin.'
    });
  }

  next();
};

module.exports = {
  authenticate,
  requireAdmin
};
