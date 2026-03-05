const Task = require('../models/Task');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all tasks sorted by newest first
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    // Validate title
    if (!title || title.trim() === '') {
      throw new AppError('Title is required and cannot be empty', 400);
    }

    // Create task
    const task = new Task({ title: title.trim() });
    const savedTask = await task.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const connectedClients = io.sockets.sockets.size;
      io.emit('taskCreated', savedTask);
    } else {
      console.error('Socket.IO instance not found! Real-time updates will not work.');
    }

    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
};

/**
 * Update task status
 */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['active', 'completed'].includes(status)) {
      throw new AppError('Status must be either "active" or "completed"', 400);
    }

    // Validate MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid task ID format', 400);
    }

    // Find and update task
    const task = await Task.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Update status
    task.status = status;
    const updatedTask = await task.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const connectedClients = io.sockets.sockets.size;
      console.log(`Emitting taskUpdated event for task: ${updatedTask._id} to ${connectedClients} connected client(s)`);
      io.emit('taskUpdated', updatedTask);
    } else {
      console.error('Socket.IO instance not found! Real-time updates will not work.');
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};
