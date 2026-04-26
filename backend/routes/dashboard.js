const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Task = require('../models/Task');

// @route  GET /api/dashboard/stats
// @access Protected
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [leadStats, taskStats] = await Promise.all([
      Lead.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            qualifiedLeads: {
              $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] },
            },
          },
        },
      ]),
      Task.aggregate([
        {
          $facet: {
            dueToday: [
              {
                $match: {
                  dueDate: { $gte: startOfDay, $lt: endOfDay },
                  status: { $ne: 'Completed' },
                },
              },
              { $count: 'count' },
            ],
            completed: [
              { $match: { status: 'Completed' } },
              { $count: 'count' },
            ],
          },
        },
      ]),
    ]);

    const leads = leadStats[0] || { totalLeads: 0, qualifiedLeads: 0 };
    const tasks = taskStats[0];

    res.json({
      totalLeads: leads.totalLeads,
      qualifiedLeads: leads.qualifiedLeads,
      tasksDueToday: tasks.dueToday[0]?.count || 0,
      completedTasks: tasks.completed[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
