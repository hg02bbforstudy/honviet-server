const express = require('express');
const router = express.Router();
const arFeedbackController = require('../controllers/arFeedbackController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Route công khai - tạo feedback
router.post('/', arFeedbackController.createFeedback);

// Routes cho admin - cần authentication
router.get('/', authenticate, requireAdmin, arFeedbackController.getAllFeedbacks);
router.delete('/:id', authenticate, requireAdmin, arFeedbackController.deleteFeedback);

module.exports = router;
