require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const { Assignment, Contest, Certification } = require('./models/DataModels');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholar-sync';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.log('MongoDB connection error:', err));

// ======================== AUTHENTICATION ROUTES ========================

// 1. Sign Up Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { id, email, password, role, semester, branch } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ id });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      id, email, password: hashedPassword, role, semester, branch
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { id, password, role } = req.body;

    // Find User
    const user = await User.findOne({ id, role });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, id: user.id, role: user.role, branch: user.branch, semester: user.semester },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, branch: user.branch, semester: user.semester }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================== DATA ENDPOINTS ========================

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// GET Assignments (Filtered for students, all for faculty)
app.get('/api/assignments', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      // Students only see assignments for their semester and branch
      query = { semester: req.user.semester };
      if (req.user.branch) {
        query.$or = [{ branch: 'ALL' }, { branch: req.user.branch }];
      }
    }
    const assignments = await Assignment.find(query);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET Coding Contests
app.get('/api/contests', authMiddleware, async (req, res) => {
  try {
    const contests = await Contest.find();
    res.json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET Certifications (Filtered for students)
app.get('/api/certifications', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { semester: req.user.semester };
      if (req.user.branch) {
        query.$or = [{ branch: 'ALL' }, { branch: req.user.branch }];
      }
    }
    const certifications = await Certification.find(query);
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Helper route to seed some sample data if none exists
app.post('/api/seed', async (req, res) => {
  try {
    await Assignment.deleteMany({});
    await Contest.deleteMany({});
    await Certification.deleteMany({});

    await Assignment.create([
      { title: 'Data Structures HW 1', description: 'Trees and Graphs', semester: '3', branch: 'CSE' },
      { title: 'Thermodynamics Lab', description: 'Lab report 1', semester: '4', branch: 'MECH' }
    ]);

    await Contest.create([
      { title: 'Weekly Coding Challenge #5', platform: 'HackerRank', date: new Date() }
    ]);

    await Certification.create([
      { title: 'AWS Cloud Practitioner', provider: 'Amazon', semester: '5', branch: 'IT' }
    ]);

    res.json({ message: 'Database seeded with sample data!' });
  } catch (err) {
    res.status(500).json({ message: 'Seed error', error: err.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
