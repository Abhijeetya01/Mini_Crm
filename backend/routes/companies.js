const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Company = require('../models/Company');
const Lead = require('../models/Lead');

// @route  GET /api/companies
// @access Protected
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/companies
// @access Protected
router.post('/', protect, async (req, res) => {
  try {
    const { name, industry, location } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });
    const company = await Company.create({ name, industry, location });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/companies/:id
// @access Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const leads = await Lead.find({ company: req.params.id, isDeleted: false })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ company, leads });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
