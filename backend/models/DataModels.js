const mongoose = require('mongoose');

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  semester: { type: String, required: true },
  branch: { type: String, required: true, default: 'ALL' },
  dueDate: { type: Date, default: () => Date.now() + 7*24*60*60*1000 }, // Default 1 week from now
  createdAt: { type: Date, default: Date.now }
});

// Contest Schema
const ContestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Certification Schema
const CertificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String, required: true },
  semester: { type: String, required: true },
  branch: { type: String, default: 'ALL' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Assignment: mongoose.model('Assignment', AssignmentSchema),
  Contest: mongoose.model('Contest', ContestSchema),
  Certification: mongoose.model('Certification', CertificationSchema)
};
