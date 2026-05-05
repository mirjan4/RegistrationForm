const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Registration = require('./models/Registration');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes using a Router
const apiRouter = express.Router();

// POST /register - Register a new user
apiRouter.post('/register', async (req, res) => {
  try {
    const { name, phone, place } = req.body;

    const existingUser = await Registration.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'This phone number is already registered.' });
    }

    const newRegistration = new Registration({ name, phone, place });
    await newRegistration.save();

    res.status(201).json({ message: 'Registration successful!', data: newRegistration });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /registrations - Get all registrations
apiRouter.get('/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations.' });
  }
});

// GET /count - Get total registration count
apiRouter.get('/count', async (req, res) => {
  try {
    const count = await Registration.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count.' });
  }
});

// DELETE /registrations/:id - Delete a registration
apiRouter.delete('/registrations/:id', async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Registration deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting registration.' });
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.send('Markaz Event API is running...');
});

// Mount the router
app.use('/api', apiRouter);


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
