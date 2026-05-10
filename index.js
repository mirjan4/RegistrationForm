// Fresh build trigger - Vercel Root Fix
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

import Member from './api/models/Member.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Multer Config for CSV Upload (Memory storage for Vercel compatibility)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ ERROR: Could not connect to MongoDB!');
    console.error('Check if MONGODB_URI is correct in your .env file.');
    console.error('Error Details:', err.message);
  });

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
    res.status(500).json({ message: 'Error searching for member.', error: error.message });
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
    res.status(500).json({ message: 'Error confirming registration.', error: error.message });
  }
});

// GET /stats - Get registration stats
apiRouter.get('/stats', async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const registered = await Member.countDocuments({ status: 'Registered' });
    const notRegistered = total - registered;
    res.json({ total, registered, notRegistered });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats.', error: error.message });
  }
});

// --- ADMIN ROUTES ---

// POST /admin/upload - Upload CSV
apiRouter.post('/admin/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const results = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on('data', (data) => results.push({
      idNumber: data.ID || data.idNumber,
      name: data.Name || data.name,
      phone: data.Phone || data.phone
    }))
    .on('end', async () => {
      try {
        const ops = results.map(m => ({
          updateOne: {
            filter: { idNumber: m.idNumber },
            update: { $set: m },
            upsert: true
          }
        }));
        await Member.bulkWrite(ops);
        res.json({ message: `${results.length} members processed successfully.` });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing CSV data.', error: error.message });
      }
    });
});

// GET /admin/members - Get all members for table
apiRouter.get('/admin/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ idNumber: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members.', error: error.message });
  }
});

// POST /admin/members - Add a member manually
apiRouter.post('/admin/members', async (req, res) => {
  try {
    const { idNumber, name, phone } = req.body;
    
    // Check if ID already exists
    const existing = await Member.findOne({ idNumber });
    if (existing) {
      return res.status(400).json({ message: 'A member with this ID already exists.' });
    }

    const newMember = new Member({ idNumber, name, phone });
    await newMember.save();
    res.status(201).json({ message: 'Member added successfully!', member: newMember });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member manually.' });
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

// --- Health & Status ---
apiRouter.get('/db-status', (req, res) => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({ 
    status: states[mongoose.connection.readyState], 
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    hasUri: !!process.env.MONGODB_URI, // Tells us if the variable exists
    env: process.env.NODE_ENV
  });
});

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is working!', timestamp: new Date() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is working!', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is working!', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('Markaz Verification API is running...');
});

// Mount the router
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler for transparency
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Catch-all for debugging
app.use((req, res) => {
  res.status(404).send(`Backend reachable! But route not found. Express saw URL: ${req.url}`);
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
