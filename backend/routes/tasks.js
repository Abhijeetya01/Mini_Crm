const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

// @route  GET /api/tasks
// @access Protected
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/tasks
// @access Protected
router.post('/', protect, async (req, res) => {
  try {
    const { title, lead, assignedTo, dueDate, status } = req.body;
    if (!title || !lead || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Title, lead, assignedTo, and dueDate are required' });
    }
    const task = await Task.create({ title, lead, assignedTo, dueDate, status });
    const populated = await task.populate(['lead', 'assignedTo']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PUT /api/tasks/:id/status
// @access Protected - only assigned user
router.put('/:id/status', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Authorization: only assigned user can update status
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: only the assigned user can update task status' });
    }

    task.status = req.body.status;
    await task.save();
    const populated = await task.populate(['lead', 'assignedTo']);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
