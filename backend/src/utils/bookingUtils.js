/**
 * ตรวจสอบการจองที่ซ้ำซ้อนกัน
 * @param {ObjectId} roomId - ID ของห้อง
 * @param {Date} startTime - เวลาเริ่มต้น
 * @param {Date} endTime - เวลาสิ้นสุด
 * @param {ObjectId} excludeBookingId - ID ของการจองที่ต้องการยกเว้น (สำหรับกรณีอัพเดทการจอง)
 * @returns {Promise<boolean>} - true ถ้ามีการซ้ำซ้อน, false ถ้าไม่มี
 */
const checkBookingOverlap = async (roomId, startTime, endTime, excludeBookingId = null) => {
    const Booking = require('../models/Booking');
    
    const query = {
      room: roomId,
      status: { $ne: 'cancelled' },
      $or: [
        // กรณี 1: การจองใหม่คาบเกี่ยวกับการจองที่มีอยู่
        { startTime: { $lt: endTime, $gte: startTime } },
        // กรณี 2: การจองที่มีอยู่คาบเกี่ยวกับการจองใหม่
        { endTime: { $gt: startTime, $lte: endTime } },
        // กรณี 3: การจองใหม่อยู่ภายในการจองที่มีอยู่
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    };
    
    // ถ้ามีการระบุ ID ที่ต้องการยกเว้น (สำหรับกรณีอัพเดท) ให้เพิ่มเงื่อนไข
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }
    
    const overlappingBooking = await Booking.findOne(query);
    
    return !!overlappingBooking;
  };
  
  module.exports = {
    checkBookingOverlap
  };