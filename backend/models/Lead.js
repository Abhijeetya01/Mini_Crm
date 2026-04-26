const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost'],
      default: 'New',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Always filter out soft-deleted leads
leadSchema.pre(/^find/, function (next) {
  if (!this.getFilter().hasOwnProperty('isDeleted')) {
    this.where({ isDeleted: false });
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
