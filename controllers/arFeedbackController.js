const ARFeedback = require('../models/ARFeedback');

// Tạo feedback mới
exports.createFeedback = async (req, res) => {
  try {
    const {
      username = '(tài khoản khách)',
      email = '',
      question1Answer,
      question2Answer,
      question3Answer
    } = req.body;

    // Validate required fields
    if (!question1Answer || !question2Answer || !question3Answer) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng trả lời đầy đủ 3 câu hỏi'
      });
    }

    // Validate enum values
    const validQ1 = ['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];
    const validQ2 = ['Rất khó', 'Khó', 'Bình thường', 'Dễ', 'Rất dễ'];
    const validQ3 = ['Chắc chắn không', 'Có thể không', 'Không chắc', 'Có thể có', 'Chắc chắn có'];

    if (!validQ1.includes(question1Answer) || 
        !validQ2.includes(question2Answer) || 
        !validQ3.includes(question3Answer)) {
      return res.status(400).json({
        success: false,
        message: 'Câu trả lời không hợp lệ'
      });
    }

    const newFeedback = new ARFeedback({
      username,
      email,
      question1Answer,
      question2Answer,
      question3Answer,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection.remoteAddress || ''
    });

    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã đánh giá!',
      data: savedFeedback
    });

  } catch (error) {
    console.error('Error creating AR feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lưu đánh giá',
      error: error.message
    });
  }
};

// Lấy tất cả feedback (dành cho admin)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      question1Filter,
      question2Filter,
      question3Filter
    } = req.query;

    // Xây dựng filter
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (question1Filter) filter.question1Answer = question1Filter;
    if (question2Filter) filter.question2Answer = question2Filter;
    if (question3Filter) filter.question3Answer = question3Filter;

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Lấy feedback với pagination
    const feedbacks = await ARFeedback.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số feedback
    const totalFeedbacks = await ARFeedback.countDocuments(filter);
    const totalPages = Math.ceil(totalFeedbacks / parseInt(limit));

    // Tính toán thống kê
    const stats = await ARFeedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          // Thống kê câu hỏi 1
          q1VeryUnsatisfied: {
            $sum: { $cond: [{ $eq: ['$question1Answer', 'Rất không hài lòng'] }, 1, 0] }
          },
          q1Unsatisfied: {
            $sum: { $cond: [{ $eq: ['$question1Answer', 'Không hài lòng'] }, 1, 0] }
          },
          q1Normal: {
            $sum: { $cond: [{ $eq: ['$question1Answer', 'Bình thường'] }, 1, 0] }
          },
          q1Satisfied: {
            $sum: { $cond: [{ $eq: ['$question1Answer', 'Hài lòng'] }, 1, 0] }
          },
          q1VerySatisfied: {
            $sum: { $cond: [{ $eq: ['$question1Answer', 'Rất hài lòng'] }, 1, 0] }
          },
          // Thống kê câu hỏi 2
          q2VeryHard: {
            $sum: { $cond: [{ $eq: ['$question2Answer', 'Rất khó'] }, 1, 0] }
          },
          q2Hard: {
            $sum: { $cond: [{ $eq: ['$question2Answer', 'Khó'] }, 1, 0] }
          },
          q2Normal2: {
            $sum: { $cond: [{ $eq: ['$question2Answer', 'Bình thường'] }, 1, 0] }
          },
          q2Easy: {
            $sum: { $cond: [{ $eq: ['$question2Answer', 'Dễ'] }, 1, 0] }
          },
          q2VeryEasy: {
            $sum: { $cond: [{ $eq: ['$question2Answer', 'Rất dễ'] }, 1, 0] }
          },
          // Thống kê câu hỏi 3
          q3DefinitelyNo: {
            $sum: { $cond: [{ $eq: ['$question3Answer', 'Chắc chắn không'] }, 1, 0] }
          },
          q3MaybeNo: {
            $sum: { $cond: [{ $eq: ['$question3Answer', 'Có thể không'] }, 1, 0] }
          },
          q3NotSure: {
            $sum: { $cond: [{ $eq: ['$question3Answer', 'Không chắc'] }, 1, 0] }
          },
          q3MaybeYes: {
            $sum: { $cond: [{ $eq: ['$question3Answer', 'Có thể có'] }, 1, 0] }
          },
          q3DefinitelyYes: {
            $sum: { $cond: [{ $eq: ['$question3Answer', 'Chắc chắn có'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFeedbacks,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        stats: stats[0] || {
          totalFeedbacks: 0,
          q1VeryUnsatisfied: 0, q1Unsatisfied: 0, q1Normal: 0, q1Satisfied: 0, q1VerySatisfied: 0,
          q2VeryHard: 0, q2Hard: 0, q2Normal2: 0, q2Easy: 0, q2VeryEasy: 0,
          q3DefinitelyNo: 0, q3MaybeNo: 0, q3NotSure: 0, q3MaybeYes: 0, q3DefinitelyYes: 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting AR feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đánh giá',
      error: error.message
    });
  }
};

// Xóa feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await ARFeedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });

  } catch (error) {
    console.error('Error deleting AR feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đánh giá',
      error: error.message
    });
  }
};
