const express = require('express');
const { 
  register, 
  login, 
  getAllUsers, 
  updateUser, 
  updateUserRole, 
  deleteUser 
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, (req, res) => {
    res.json(req.user);
});

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.put('/:id', authMiddleware, updateUser);
router.put('/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;