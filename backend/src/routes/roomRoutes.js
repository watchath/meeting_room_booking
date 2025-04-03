const express = require('express');
const { 
  createRoom, 
  getAllRooms, 
  getRoomById, 
  updateRoom, 
  deleteRoom,
  getRoomStats, 
  getAvailableRooms,
  checkRoomStatus, 
  updateAllRoomStatus
} = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/find-available', authMiddleware, getAvailableRooms);
router.get('/', authMiddleware, getAllRooms);
router.get('/stats/overview', authMiddleware, adminMiddleware, getRoomStats);
router.post('/update-status', authMiddleware, adminMiddleware, updateAllRoomStatus);
router.get('/:id/status', authMiddleware, checkRoomStatus);
router.get('/:id', authMiddleware, getRoomById);
router.post('/', authMiddleware, adminMiddleware, createRoom);
router.put('/:id', authMiddleware, adminMiddleware, updateRoom);
router.delete('/:id', authMiddleware, adminMiddleware, deleteRoom);

module.exports = router;