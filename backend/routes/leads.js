const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Lead = require('../models/Lead');

// @route  GET /api/leads
// @access Protected
router.get('/', protect, async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/leads
// @access Protected
router.post('/', protect, async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, company } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const lead = await Lead.create({ name, email, phone, status, assignedTo: assignedTo || null, company: company || null });
    const populated = await lead.populate(['assignedTo', 'company']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PUT /api/leads/:id
// @access Protected
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, company } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, assignedTo: assignedTo || null, company: company || null },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('company', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  DELETE /api/leads/:id  (soft delete)
// @access Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
