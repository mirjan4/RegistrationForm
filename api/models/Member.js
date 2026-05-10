const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Not Registered', 'Registered'],
    default: 'Not Registered'
  },
  registrationTime: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
