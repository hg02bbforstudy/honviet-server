const mongoose = require('mongoose');

const arFeedbackSchema = new mongoose.Schema({
  // Thông tin người dùng
  username: {
    type: String,
    required: true,
    default: '(tài khoản khách)'
  },
  email: {
    type: String,
    default: ''
  },
  
  // Kết quả 3 câu hỏi đánh giá
  question1Answer: {
    type: String,
    required: true,
    enum: ['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng']
  },
  question2Answer: {
    type: String,
    required: true,
    enum: ['Rất khó', 'Khó', 'Bình thường', 'Dễ', 'Rất dễ']
  },
  question3Answer: {
    type: String,
    required: true,
    enum: ['Chắc chắn không', 'Có thể không', 'Không chắc', 'Có thể có', 'Chắc chắn có']
  },
  
  // Thông tin bổ sung
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Index để tối ưu truy vấn
arFeedbackSchema.index({ createdAt: -1 });
arFeedbackSchema.index({ email: 1 });
arFeedbackSchema.index({ username: 1 });

module.exports = mongoose.model('ARFeedback', arFeedbackSchema);
