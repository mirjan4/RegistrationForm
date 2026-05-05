const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Registration = require('./models/Registration');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/markaz_event')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes

// POST /api/register - Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, place } = req.body;

    // Check if phone number already exists
    const existingUser = await Registration.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'This phone number is already registered.' });
    }

    const newRegistration = new Registration({ name, phone, place });
    await newRegistration.save();

    res.status(201).json({ message: 'Registration successful!', data: newRegistration });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// GET /api/registrations - Get all registrations (for admin)
app.get('/api/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations.' });
  }
});

// GET /api/count - Get total registration count
app.get('/api/count', async (req, res) => {
  try {
    const count = await Registration.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count.' });
  }
});

// DELETE /api/registrations/:id - Delete a registration (optional/admin)
app.delete('/api/registrations/:id', async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Registration deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting registration.' });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
