const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { checkBookingOverlap } = require('../utils/bookingUtils');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    
    const { roomId, startTime, endTime, purpose, participants } = req.body;
    const userId = req.user.id; // จาก middleware authentication

    if(!roomId || !startTime || !endTime || !purpose){
      return res.status(400).json({ message : 'Please provide all require field ' });
    }

    //ตรวจสอบความถูกต้องของเวลา
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if(start >= end){
      return res.status(400).json({ message : 'End time must be after start time' });
    }

    if (start < now) {
      return res.status(400).json({ message : 'Cannot book in the past' });
    }

    // ตรวจสอบการชนกันของเวลาจอง
    const conflictBooking = await Booking.findOne({
      room: roomId,
      $or: [
        // { startTime: { $lt: endTime, $gte: startTime } },
        // การจองใหม่คาบเกี่ยวกับการจองที่มีอยู่
        { startTime: { $lt: end, $gte: start } },
        // { endTime: { $gt: startTime, $lte: endTime } },
        // การจองที่มีคาบเกี่ยวกับการจองใหม่
        { endTime: { $gt: start, $lte: end } },
        // { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        // การจองใหม่อยู่ภายในการจองที่มีอยู่
        { startTime: { $lte: start }, endTime: {$gte: end } }
      ],
      status: { $ne: 'cancelled' }
    });

    if (conflictBooking) {
      return res.status(400).json({ 
        message: 'Room is already booked for this time slot',
        conflictBooking: {
          id: conflictBooking._id,
          startTime: conflictBooking.startTime,
          endTime: conflictBooking.endTime
        } 
      });
    }

    // ตรวจสอบว่าห้องมีสถานะพร้อมใช้งานหรือไม่
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (room.status === 'maintenance') {
      return res.status(400).json({ message: 'Room is under maintenance and not available for booking' });
    }

    const newBooking = new Booking({
      room: roomId,
      user: userId,
      startTime,
      endTime,
      purpose,
      participants: participants || [],
      status: 'confirmed' // หรือ 'pending' ตามการออกแบบระบบ
    });

    await newBooking.save();

    // อัพเดทสถานะห้องเป็น booked
    await Room.findByIdAndUpdate(roomId, { status: 'booked' });

    // ดึงข้อมูลการจองพร้อมข้อมูลห้องและผู้ใช้
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('room')
      .populate('user', 'username email');

    // res.status(201).json(newBooking);
    res.status(201).json({ 
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    // res.status(400).json({ message: 'Error creating booking', error: error.message });
    console.error('Error creating booking: ', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room')
      .populate('participants', 'username email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    // ค้นหาการจอง
    const booking = await Booking.findById(bookingId);
    
    // ตรวจสอบว่าพบการจองหรือไม่
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของการจองหรือแอดมิน
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // อัพเดทสถานะการจอง
    booking.status = 'cancelled';
    await booking.save();
    
    // ตรวจสอบว่ามีการจองอื่นที่ใช้ห้องนี้อยู่หรือไม่
    const currentTime = new Date();
    const activeBookings = await Booking.find({
      room: booking.room,
      status: 'confirmed',
      endTime: { $gt: currentTime },
      _id: { $ne: bookingId } // ไม่รวมการจองปัจจุบัน
    });
    
    // ถ้าไม่มีการจองอื่นที่กำลังใช้งานอยู่ อัพเดทสถานะห้องเป็น available
    if (activeBookings.length === 0) {
      await Room.findByIdAndUpdate(booking.room, { status: 'available' });
    }
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error cancelling booking', error: error.message });
  }
};

// ดึงการจองทั้งหมด (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const bookings = await Booking.find()
      .populate('room')
      .populate('user', 'username email department')
      .populate('participants', 'username email');
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'username email')
      .populate('participants', 'username email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

exports.checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, date } = req.query;
    
    // แปลงวันที่ที่ได้รับเป็น Date object
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
    
    // ค้นหาการจองทั้งหมดในวันที่ระบุ
    const bookings = await Booking.find({
      room: roomId,
      startTime: { $lte: endOfDay },
      endTime: { $gte: startOfDay },
      status: { $ne: 'cancelled' }
    });
    
    // สร้างข้อมูลช่วงเวลาที่ถูกจอง
    const bookedTimeSlots = bookings.map(booking => ({
      start: booking.startTime,
      end: booking.endTime,
      purpose: booking.purpose
    }));
    
    res.json({
      roomId,
      date: date,
      bookedTimeSlots
    });
  } catch (error) {
    res.status(400).json({ message: 'Error checking availability', error: error.message });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, purpose, participants, status } = req.body;
    const userId = req.user.id;

    // ค้นหาการจอง
    const booking = await Booking.findById(id);
    
    // ตรวจสอบว่าพบการจองหรือไม่
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    // ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของหรือแอดมิน)
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this booking' 
      });
    }

    // ถ้ามีการแก้ไขเวลา ให้ตรวจสอบการซ้ำซ้อน
    if ((startTime && startTime !== booking.startTime) || 
        (endTime && endTime !== booking.endTime)) {
      
      const newStartTime = startTime || booking.startTime;
      const newEndTime = endTime || booking.endTime;
      
      const hasOverlap = await checkBookingOverlap(
        booking.room, 
        newStartTime, 
        newEndTime,
        id // ยกเว้นการจองปัจจุบัน
      );
      
      if (hasOverlap) {
        return res.status(400).json({ 
          success: false,
          message: 'Your new booking time overlaps with another booking' 
        });
      }
    }

    // อัพเดทข้อมูล
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        startTime: startTime || booking.startTime,
        endTime: endTime || booking.endTime,
        purpose: purpose || booking.purpose,
        participants: participants || booking.participants,
        status: status || booking.status
      },
      { new: true } // คืนค่าข้อมูลที่อัพเดทแล้ว
    ).populate('room').populate('user', 'username email');

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ตรวจสอบความถูกต้องของสถานะ
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // ค้นหาการจอง
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ตรวจสอบสิทธิ์ (ต้องเป็น admin หรือเจ้าของการจอง)
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.user.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // ถ้าไม่ใช่ admin และกำลังจะยืนยันการจอง ให้ทำไม่ได้
    if (!isAdmin && status === 'confirmed' && booking.status === 'pending') {
      return res.status(403).json({ message: 'Only admins can confirm bookings' });
    }

    // อัพเดทสถานะการจอง
    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // จัดการสถานะห้องเมื่อสถานะการจองเปลี่ยน
    const currentTime = new Date();
    const bookingEnded = new Date(booking.endTime) < currentTime;
    
    if (status === 'cancelled' || (oldStatus === 'confirmed' && status !== 'confirmed')) {
      // ถ้ายกเลิกหรือเปลี่ยนจาก confirmed เป็นอย่างอื่น ต้องตรวจสอบว่ามีการจองอื่นอยู่หรือไม่
      const activeBookings = await Booking.find({
        room: booking.room,
        status: 'confirmed',
        endTime: { $gt: currentTime },
        _id: { $ne: id }
      });
      
      // ถ้าไม่มีการจองอื่น ให้อัพเดทสถานะห้องเป็น available
      if (activeBookings.length === 0) {
        await Room.findByIdAndUpdate(booking.room, { status: 'available' });
      }
    } 
    else if (status === 'confirmed' && !bookingEnded) {
      // ถ้ายืนยันการจอง และการจองยังไม่สิ้นสุด ให้อัพเดทสถานะห้องเป็น booked
      await Room.findByIdAndUpdate(booking.room, { status: 'booked' });
    }

    // ส่งกลับข้อมูลการจองที่อัพเดทแล้ว
    const updatedBooking = await Booking.findById(id)
      .populate('room')
      .populate('user', 'username email');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ดึงข้อมูลสถิติการจอง (admin only)
exports.getBookingStats = async (req, res) => {
  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // นับจำนวนการจองตามสถานะ
    const bookings = await Booking.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookingStats = {
      total: bookings.length,
      confirmed: bookings.filter(booking => booking.status === 'confirmed').length,
      pending: bookings.filter(booking => booking.status === 'pending').length,
      cancelled: bookings.filter(booking => booking.status === 'cancelled').length,
      today: bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime() && booking.status !== 'cancelled';
      }).length,
      tomorrow: bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === tomorrow.getTime() && booking.status !== 'cancelled';
      }).length
    };

    // ข้อมูลผู้ใช้ที่มีการจองมากที่สุด
    const userBookings = {};
    bookings.forEach(booking => {
      const userId = booking.user.toString();
      userBookings[userId] = (userBookings[userId] || 0) + 1;
    });
    
    let topUsersByBooking = [];
    for (const [userId, count] of Object.entries(userBookings)) {
      topUsersByBooking.push({ userId, count });
    }
    
    // เรียงลำดับผู้ใช้ตามจำนวนการจอง
    topUsersByBooking.sort((a, b) => b.count - a.count);
    
    // จัดเตรียมข้อมูลผู้ใช้ที่มีการจองมากที่สุด 3 อันดับแรก
    if (topUsersByBooking.length > 0) {
      const topUserIds = topUsersByBooking.slice(0, 3).map(item => item.userId);
      const topUsers = await User.find(
        { _id: { $in: topUserIds } }, 
        'username email department'
      );
      
      bookingStats.topUsers = topUsersByBooking.slice(0, 3).map(item => {
        const user = topUsers.find(u => u._id.toString() === item.userId);
        return {
          user: user || { username: 'Unknown User' },
          bookingCount: item.count
        };
      });
    } else {
      bookingStats.topUsers = []; // เพิ่มค่าเริ่มต้นเป็น array ว่าง
    }

    // ข้อมูลจำนวนการจองรายเดือน (สำหรับกราฟ)
    // สร้างข้อมูลจำลอง
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    
    // สร้างข้อมูลย้อนหลัง 6 เดือน
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      // นับจำนวนการจองในเดือนนี้
      const count = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getMonth() === month && bookingDate.getFullYear() === year;
      }).length;
      
      monthlyData.push({
        month: monthNames[month],
        year: year,
        bookings: count
      });
    }
    
    bookingStats.monthlyData = monthlyData;

    res.json(bookingStats);
  } catch (error) {
    console.error('Error generating booking stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkUserOverlappingBookings = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const userId = req.user.id;

    // check data
    if (!startTime || !endTime){
      return res.status(400).json({ message: 'Please provide startTime and endTime.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    //Search user's booked in current date time
    const overlappingBookings = await Booking.find({
      user: userId,
      status : { $ne: 'cancelled' },
      $or: [
        { startTime : { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    }).populate('room', 'name location');

    res.json({
      hasOverlap: overlappingBookings.length > 0,
      overlappingBookings
    })
  } catch(error) {
    console.error('Error checking overlapping bookings: ', error);
    res.status(500).json({ message: 'Server error ', error: error.message});
  }
};
