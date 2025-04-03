const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'maintenance', 'booked'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);