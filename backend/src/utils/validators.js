const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validateBookingTimes = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // ตรวจสอบว่าเวลาเริ่มต้นไม่มากกว่าเวลาสิ้นสุด
  if (start >= end) {
    return {
      valid: false,
      message: 'Start time must be before end time'
    };
  }
  
  // ตรวจสอบว่าเวลาไม่อยู่ในอดีต
  const now = new Date();
  if (start < now) {
    return {
      valid: false,
      message: 'Cannot book in the past'
    };
  }

  // ตรวจสอบว่าการจองไม่เกิน 4 ชั่วโมง
  const maxDuration = 4 * 60 * 60 * 1000; // 4 ชั่วโมงในมิลลิวินาที
  if (end - start > maxDuration) {
    return {
      valid: false,
      message: 'Booking duration cannot exceed 4 hours'
    };
  }
  
  return { valid: true };
};

const validateTimeSlot = (startTime, endTime, existingBookings) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // ตรวจสอบการทับซ้อนกับการจองที่มีอยู่
  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    
    // ตรวจสอบการทับซ้อน
    if (
      (start >= bookingStart && start < bookingEnd) || // เริ่มระหว่างการจองที่มีอยู่
      (end > bookingStart && end <= bookingEnd) || // จบระหว่างการจองที่มีอยู่
      (start <= bookingStart && end >= bookingEnd) // ครอบคลุมการจองที่มีอยู่
    ) {
      return {
        valid: false,
        message: `Time slot conflicts with existing booking (${bookingStart.toLocaleString()} - ${bookingEnd.toLocaleString()})`
      };
    }
  }
  
  return { valid: true };
};

module.exports = {
  validateEmail,
  validateBookingTimes,
  validateTimeSlot
};