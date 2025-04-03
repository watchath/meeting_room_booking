const express = require('express');
const { 
  createBooking, 
  getUserBookings, 
  getAllBookings, 
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  checkRoomAvailability,
  getBookingStats,
  checkUserOverlappingBookings
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Protected routes
router.get('/stats/overview', authMiddleware, adminMiddleware, getBookingStats);
router.get('/', authMiddleware, adminMiddleware, getAllBookings);
router.get('/my-bookings', authMiddleware, getUserBookings);
router.get('/availability', authMiddleware, checkRoomAvailability);
router.get('/check-overlapping', authMiddleware, checkUserOverlappingBookings)
router.post('/', authMiddleware, createBooking);
router.delete('/:id', authMiddleware, cancelBooking);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/status', authMiddleware, updateBookingStatus);



module.exports = router;