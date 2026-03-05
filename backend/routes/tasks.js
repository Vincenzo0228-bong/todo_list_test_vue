const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const taskController = require('../controllers/taskController');

// GET /api/tasks - Get all tasks sorted by newest first
router.get('/', asyncHandler(taskController.getAllTasks));

// POST /api/tasks - Create a new task
router.post('/', asyncHandler(taskController.createTask));

// PATCH /api/tasks/:id - Update task status
router.route('/:id')
  .patch(asyncHandler(taskController.updateTaskStatus));

module.exports = router;
