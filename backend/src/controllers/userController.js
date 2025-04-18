const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail } = require('../utils/validators');

exports.register = async (req, res) => {
  try {
    const { username, email, password, department } = req.body;

    // ตรวจสอบรูปแบบอีเมล
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // ตรวจสอบว่ามี User นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง User ใหม่
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      department
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ค้นหา User
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ตรวจสอบ Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // สร้าง Token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h',
        algorithm: 'HS512' // ระบุอัลกอริทึม HS512
      }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        department: user.department
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { email, department } = req.body;
    
    // ตรวจสอบรูปแบบอีเมล
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // ค้นหาและอัพเดท User
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { email, department } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ดึงข้อมูลผู้ใช้ทั้งหมด (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// อัพเดทข้อมูลผู้ใช้ (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, department, role } = req.body;

    // ตรวจสอบว่าเป็น admin หรือเจ้าของบัญชี
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // สร้างออบเจ็กต์สำหรับอัพเดท
    const updateData = {};
    if (email) updateData.email = email;
    if (department) updateData.department = department;
    if (role && req.user.role === 'admin') updateData.role = role; // เฉพาะ admin เท่านั้นที่เปลี่ยน role ได้

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// อัพเดทสิทธิ์ผู้ใช้ (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ตรวจสอบความถูกต้องของ role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ลบผู้ใช้ (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ลบผู้ใช้
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ลบหรืออัพเดทการจองที่เกี่ยวข้องกับผู้ใช้นี้
    // (อาจเลือกที่จะลบหรือเปลี่ยนสถานะการจองเป็น 'cancelled' ก็ได้)
    await Booking.updateMany(
      { user: id },
      { status: 'cancelled' }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};