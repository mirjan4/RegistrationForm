const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Member = require('./models/Member');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Multer Config for CSV Upload
const upload = multer({ dest: 'uploads/' });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
const apiRouter = express.Router();

// --- USER ROUTES ---

// GET /search/:id - Find member by ID
apiRouter.get('/search/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ idNumber: req.params.id });
    if (!member) {
      return res.status(404).json({ message: 'Invalid ID Number. Member not found.' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error searching for member.' });
  }
});

// POST /confirm - Confirm registration
apiRouter.post('/confirm', async (req, res) => {
  try {
    const { idNumber } = req.body;
    const member = await Member.findOne({ idNumber });

    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    if (member.status === 'Registered') {
      return res.status(400).json({ message: 'This ID is already registered.' });
    }

    member.status = 'Registered';
    member.registrationTime = new Date();
    await member.save();

    res.json({ message: 'Registration confirmed successfully!', member });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming registration.' });
  }
});

// GET /count - Get registration stats
apiRouter.get('/stats', async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const registered = await Member.countDocuments({ status: 'Registered' });
    const notRegistered = total - registered;
    res.json({ total, registered, notRegistered });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats.' });
  }
});

// --- ADMIN ROUTES ---

// POST /admin/upload - Upload CSV
apiRouter.post('/admin/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push({
      idNumber: data.ID || data.idNumber,
      name: data.Name || data.name,
      phone: data.Phone || data.phone
    }))
    .on('end', async () => {
      try {
        // Bulk upsert to prevent duplicates and update existing
        const ops = results.map(m => ({
          updateOne: {
            filter: { idNumber: m.idNumber },
            update: { $set: m },
            upsert: true
          }
        }));
        await Member.bulkWrite(ops);
        fs.unlinkSync(req.file.path); // Delete temp file
        res.json({ message: `${results.length} members processed successfully.` });
      } catch (error) {
        console.error(error);
        res.status(500).send('Error processing CSV data.');
      }
    });
});

// GET /admin/members - Get all members for table
apiRouter.get('/admin/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ idNumber: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members.' });
  }
});

// DELETE /admin/members/:id - Delete a member
apiRouter.delete('/admin/members/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member.' });
  }
});

app.get('/', (req, res) => {
  res.send('Markaz Verification API is running...');
});

app.use('/api', apiRouter);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
