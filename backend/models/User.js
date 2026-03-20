const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty'],
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    default: null // Only strict for students
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
