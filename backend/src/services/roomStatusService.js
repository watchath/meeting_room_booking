const Room = require('../models/Room');
const Booking = require('../models/Booking');

/**
 * ตรวจสอบและอัพเดทสถานะห้องอัตโนมัติ
 * - ห้องที่มีการจองและเวลาจองผ่านไปแล้วจะถูกเปลี่ยนเป็น available
 */
const updateRoomStatus = async () => {
    try {
      console.log('[ROOM STATUS] Checking for rooms with ended bookings...');
      const now = new Date();
      
      // ค้นหาห้องที่มีสถานะ booked และมีการจองล่าสุดหมดเวลาไปแล้ว
      const bookedRooms = await Room.find({ status: 'booked' });
      console.log(`[ROOM STATUS] Found ${bookedRooms.length} booked rooms to check`);
      
      for (const room of bookedRooms) {
        // ค้นหาการจองที่กำลังใช้ห้องนี้อยู่ (ยังไม่หมดเวลา และไม่ถูกยกเลิก)
        const activeBooking = await Booking.findOne({
          room: room._id,
          endTime: { $gt: now },
          status: 'confirmed'
        });
        
        // ถ้าไม่มีการจองที่กำลังใช้งานอยู่ แสดงว่าห้องว่าง
        if (!activeBooking) {
          console.log(`[ROOM STATUS] Room ${room.name} (${room._id}) is actually free now - updating to available`);
          
          // อัพเดทสถานะห้องเป็น available
          await Room.findByIdAndUpdate(room._id, { status: 'available' });
        }
      }
      
      console.log('[ROOM STATUS] Room status check completed');
    } catch (error) {
      console.error('[ROOM STATUS] Error updating room status:', error);
    }
  };
  
  module.exports = {
    updateRoomStatus
  };
  