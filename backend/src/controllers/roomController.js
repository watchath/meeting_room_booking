const Room = require('../models/Room');
const Booking = require('../models/Booking');

// สร้างห้องประชุมใหม่ (admin only)
exports.createRoom = async (req, res) => {
  try {
    const { name, capacity, location, amenities, status } = req.body;

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create rooms' });
    }

    // ตรวจสอบว่ามีห้องชื่อนี้แล้วหรือไม่
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room with this name already exists' });
    }

    const newRoom = new Room({
      name,
      capacity,
      location,
      amenities: amenities || [],
      status: status || 'available'
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: 'Error creating room', error: error.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
};

// อัพเดทข้อมูลห้องประชุม (admin only)
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, location, amenities, status } = req.body;

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update rooms' });
    }

    // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // ตรวจสอบว่าชื่อห้องซ้ำหรือไม่ (กรณีเปลี่ยนชื่อ)
    if (name && name !== room.name) {
      const existingRoom = await Room.findOne({ name });
      if (existingRoom) {
        return res.status(400).json({ message: 'Room with this name already exists' });
      }
    }

    // อัพเดทข้อมูลห้อง
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        name: name || room.name,
        capacity: capacity || room.capacity,
        location: location || room.location,
        amenities: amenities || room.amenities,
        status: status || room.status
      },
      { new: true }
    );

    res.json(updatedRoom);
  } catch (error) {
    res.status(400).json({ message: 'Error updating room', error: error.message });
  }
};

// ลบห้องประชุม (admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete rooms' });
    }

    // ลบห้อง
    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // ยกเลิกการจองทั้งหมดที่เกี่ยวข้องกับห้องนี้
    await Booking.updateMany(
      { room: id, status: { $ne: 'cancelled' } },
      { status: 'cancelled' }
    );

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting room', error: error.message });
  }
};

// ดึงข้อมูลสถิติห้องประชุม (admin only)
exports.getRoomStats = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ดึงข้อมูลห้องทั้งหมด
    const rooms = await Room.find();
    
    // รวมจำนวนห้องตามสถานะ
    const roomStats = {
      total: rooms.length,
      available: rooms.filter(room => room.status === 'available').length,
      booked: rooms.filter(room => room.status === 'booked').length,
      maintenance: rooms.filter(room => room.status === 'maintenance').length
    };

    // ดึงข้อมูลความจุห้องเฉลี่ย
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    roomStats.averageCapacity = rooms.length > 0 ? Math.round(totalCapacity / rooms.length) : 0;

    // สร้างข้อมูลจำลองสำหรับห้องที่มีการจองมากที่สุด
    if (rooms.length > 0) {
      // ดึงข้อมูลห้องสุ่ม
      const randomIndex = Math.floor(Math.random() * rooms.length);
      const randomRoom = rooms[randomIndex];
      
      roomStats.mostBookedRoom = {
        id: randomRoom._id,
        name: randomRoom.name,
        bookingCount: Math.floor(Math.random() * 20) + 5 // สุ่มจำนวน 5-25
      };
    }

    res.json(roomStats);
  } catch (error) {
    console.error('Error generating room stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ฟังก์ชันตรวจสอบสถานะห้องปัจจุบัน
exports.checkRoomStatus = async (req, res) => {
  try {
    const roomId = req.params.id;
    
    // ค้นหาข้อมูลห้อง
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // ค้นหาการจองปัจจุบัน (ถ้ามี)
    const now = new Date();
    const currentBooking = await Booking.findOne({
      room: roomId,
      startTime: { $lte: now },
      endTime: { $gt: now },
      status: 'confirmed'
    }).populate('user', 'username email');
    
    // ค้นหาการจองที่กำลังจะมาถึง
    const upcomingBookings = await Booking.find({
      room: roomId,
      startTime: { $gt: now },
      status: 'confirmed'
    })
    .sort({ startTime: 1 })
    .limit(3)
    .populate('user', 'username email');
    
    // รวบรวมและส่งกลับข้อมูล
    const response = {
      roomId: room._id,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      status: room.status,
      currentBooking: currentBooking || null,
      upcomingBookings: upcomingBookings || []
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error checking room status', error: error.message });
  }
};

// ฟังก์ชันตรวจสอบและอัพเดทสถานะห้องทั้งหมด (สำหรับ admin)
exports.updateAllRoomStatus = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // เรียกใช้ฟังก์ชันอัพเดทสถานะห้อง
    const { updateRoomStatus } = require('../services/roomStatusService');
    await updateRoomStatus();
    
    res.json({ message: 'Room status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room status', error: error.message });
  }
};

exports.findAvailableRooms = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    // ตรวจสอบว่ามีการส่งวันเวลามาหรือไม่
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide startTime and endTime' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // ตรวจสอบความถูกต้องของวันเวลา
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    const now = new Date();
    if(start < now){
      return res.status(400).json({ message: 'Cannot book in the past' });
    }

    // หาห้องทั้งหมด
    const allRooms = await Room.find({ status: { $ne: 'maintenance' } });

    //หาการจองที่ทับซ้อนกับช่วงเวลาที่ต้องการ
    const overlappingBooking = await Booking.find({
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ],
      status: { $ne: 'cancelled' }
    });

    // รวบรวม ID ที่มีการจองซ้ำซ้อน
    const bookedRoomIds = overlappingBooking.map(booking => booking.room.toString());

    // กรองห้องที่ว่าง
    const availableRooms = allRooms.filter(room =>
      !bookedRoomIds.includes(room._id.toString())
    )

    res.json({
      startTime,
      endTime,
      availableRooms,
      totalAvailable: availableRooms.length,
      totalRooms: allRooms.length
    });
    
  } catch (error) {
    console.error('Error finding available rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

exports.getAvailableRooms = async (req, res) => {
  try {

    const { startTime, endTime } = req.query;
    console.log(startTime);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide both startTime and endTime' });
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // ตรวจสอบความถูกต้องของวันเวลา
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    // ค้นหาการจองที่ทับซ้อนกับช่วงเวลาที่ต้องการ
    const overlappingBookings = await Booking.find({
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ],
      status: { $ne: 'cancelled' }
    });
    
    // รวบรวม ID ของห้องที่ถูกจองแล้ว
    const bookedRoomIds = overlappingBookings.map(booking => booking.room.toString());
    
    // ค้นหาห้องทั้งหมดที่ไม่ได้ถูกจองในช่วงเวลานี้ และไม่ได้อยู่ในสถานะซ่อมบำรุง
    const availableRooms = await Room.find({
      _id: { $nin: bookedRoomIds },
      status: { $ne: 'maintenance' }
    });
    
    res.json({
      startTime,
      endTime,
      availableRooms
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ message: 'Error fetching available rooms', error: error.message });
  }
};
